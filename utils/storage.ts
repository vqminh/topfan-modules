import { BUCKET, storage } from "./firebase";
import { LOGGER, reportError } from "./logging";
import { generateId, getBucketURL, MAX_IMAGE_SIZE } from "./id";
import {
  deleteObject,
  ref,
  uploadBytes,
  uploadBytesResumable,
} from "firebase/storage";

export const IMAGES = ".png,.jpeg,.jpg,.gif,.svg";
export const VIDEOS = ".mp4,.mov";
export const MEDIA = IMAGES + "," + VIDEOS;
export const VIDEO_THUMBNAIL = `${BUCKET}video.png`;

export function getVideoImage(path: string, secs: number = 1) {
  return new Promise<string>((resolve, reject) => {
    const video = document.createElement("video");
    video.crossOrigin = "anonymous";
    video.onloadedmetadata = () => (video.currentTime = secs);
    video.addEventListener("timeupdate", () => {
      const canvas = getImageFromVideo(video);
      resolve(canvas.toDataURL());
    });
    video.onerror = reject;
    video.src = path;
  });
}

export function getVideoMetadata(file: File | Blob | string) {
  return new Promise<{
    duration: number;
    width: number;
    height: number;
  }>((resolve, reject) => {
    const video = document.createElement("video");
    video.crossOrigin = "anonymous";
    video.onloadedmetadata = () => {
      URL.revokeObjectURL(video.src);
      resolve({
        duration: video.duration,
        width: video.videoWidth,
        height: video.videoHeight,
      });
    };
    video.onerror = reject;
    video.src = typeof file === "string" ? file : URL.createObjectURL(file);
  });
}

export function getImageFromVideo(
  video: HTMLVideoElement,
  maxSize: number = MAX_IMAGE_SIZE
) {
  video.crossOrigin = "anonymous";
  const canvas = document.createElement("canvas");
  canvas.height = video.videoHeight;
  canvas.width = video.videoWidth;
  if (canvas.height > maxSize) {
    canvas.width = (video.videoWidth / canvas.height) * maxSize;
    canvas.height = maxSize;
  }
  if (canvas.width > maxSize) {
    canvas.height = (video.videoHeight / canvas.width) * maxSize;
    canvas.width = maxSize;
  }

  const context = canvas.getContext("2d");
  if (context) {
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
  }
  return canvas;
}

/**
 * Convert to file to upload to storage
 * @param url
 */
export function urlToFile(url: string): Promise<File> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("GET", url, true);
    xhr.responseType = "blob"; //force the HTTP response, response-type header to be blob
    xhr.onload = () => {
      const blob = xhr.response;
      resolve(blob);
    };
    xhr.onerror = reject;
    xhr.send();
  });
}

export function getRedirectedUrl(url: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const req = new XMLHttpRequest();
    req.onreadystatechange = function () {
      if (req.readyState === 4) {
        resolve(req.responseURL);
      } else {
        resolve(url);
      }
    };
    req.onerror = reject;
    req.open("GET", url, true);
    req.send();
  });
}

export function getSize(file: File | Blob | string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = typeof file === "string" ? file : URL.createObjectURL(file);
  });
}

export function getThumbnailUrl(id: string) {
  return `https://img.youtube.com/vi/${id}/mqdefault.jpg`;
}

export function getVideoThumbnail(href: string) {
  const id = getVideoId(href);
  if (id) {
    return getThumbnailUrl(id);
  }
  return VIDEO_THUMBNAIL;
}

export function getVideoId(href: string) {
  try {
    const url = new URL(href);
    let id: string | null = null;
    if (url.hostname === "www.youtube.com") {
      // https://www.youtube.com/watch?v=Xex2YH2xdIQ
      id = url.searchParams.get("v");
    } else if (url.hostname === "youtu.be") {
      // https://youtu.be/mwDVayzR258
      id = url.pathname.substring(1);
    }
    return id;
  } catch (e: any) {
    console.error(e, "href = " + href);
    return null;
  }
}

export function fetchJson(url: string) {
  return fetch(url).then((data) => data.json());
}

export function uploadFile(
  file: File | Blob,
  path: string,
  onProgress?: (percent: number) => void
) {
  LOGGER(`Uploading ${file} to ${path}`);
  return new Promise<string>((resolve, reject) => {
    const uploadTask = uploadBytesResumable(ref(storage, path), file, {
      contentType: file.type,
      cacheControl: "public,max-age=31536000",
    });
    uploadTask.on(
      "state_changed",
      (snapshot) => {
        // Observe state change events such as progress, pause, and resume
        // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
        const percent = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        onProgress?.(percent);
      },
      (e) => {
        reportError(e, `Could not upload ${file.size}b to ${path}`);
        reject(e);
      },
      () => resolve(getBucketURL(path) + "?ts=" + generateId())
    );
  });
}

export function getFileName(name: string) {
  const i = name.lastIndexOf(".");
  return name.substring(0, i);
}

export function getFileExtension(name: string) {
  const i = name.lastIndexOf("/");
  return "." + name.substring(i + 1);
}

export function resizeImage(
  file: File,
  maxWidth: number = MAX_IMAGE_SIZE,
  maxHeight: number = MAX_IMAGE_SIZE
): Promise<{
  file: File;
  width?: number;
  height?: number;
}> {
  if (!file.type.startsWith("image/")) {
    return Promise.resolve({
      file,
    });
  }
  return getSize(file).then((image) => {
    const webp = file.type === "image/webp";
    let width = image.width;
    let height = image.height;
    if (webp || image.height > maxHeight || image.width > maxWidth) {
      console.log("Resizing image");
      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d");
      if (!context) {
        throw new Error("browser not support");
      }
      if (width > height) {
        if (width > maxWidth) {
          height *= maxWidth / width;
          width = maxWidth;
        }
      } else {
        if (height > maxHeight) {
          width *= maxHeight / height;
          height = maxHeight;
        }
      }
      canvas.width = width;
      canvas.height = height;
      // context.globalAlpha = 1;
      context.drawImage(image, 0, 0, width, height);
      const type = webp ? "image/jpeg" : file.type;
      return new Promise((resolve) =>
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              throw new Error("could not convert to blob");
            }
            const resized = new File(
              [blob],
              webp
                ? getFileName(file.name) + getFileExtension(type)
                : file.name,
              {
                type,
                lastModified: file.lastModified,
              }
            );
            resolve({
              file: resized,
              width,
              height,
            });
          },
          type,
          0.85
        )
      );
    }
    return {
      file,
      width,
      height,
    };
  });
}

export function upload(folder: string, files: File[]) {
  return Promise.all(
    files.map((file) => {
      if (file) {
        return uploadBytes(ref(storage, folder), file, {
          contentType: file.type,
          cacheControl: "public,max-age=31536000",
        });
      } else {
        return Promise.resolve(file);
      }
    })
  ).catch((e) => {
    reportError(e);
    throw e;
  });
}

export function deleteFile(path: string) {
  return deleteObject(ref(storage, path));
}
