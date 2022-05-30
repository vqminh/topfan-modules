import type { FC } from "react";
import React, { ChangeEvent, useRef, useState } from "react";
import { useUI } from "../../src/contexts/ui.context";
import { useFormContext } from "react-hook-form";
import { useTranslation } from "next-i18next";
import { generateId, getOriginal, getPoster } from "../utils/id";
import { VideoType } from "../../src/framework/basic-rest/booking-types";

interface ProductProps {
  name: string;
  filePath: string;
  autoSave: (name: string, value: VideoType) => Promise<any> | undefined;
  toast: boolean;
}

const VideoInput: FC<ProductProps> = ({
  name,
  filePath,
  autoSave,
  toast = false,
}) => {
  const { openModal, setModalView, setModalData } = useUI();
  const input = useRef<HTMLInputElement>(null);
  const { getValues, reset } = useFormContext();
  const currentValue = getValues(name) as VideoType;
  const [video, setVideo] = useState(currentValue);
  const videoRef = useRef<HTMLVideoElement>(null);
  const { t } = useTranslation();

  async function startUploading(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (file) {
      const { type } = file;
      const extension = file.name.split(".").pop();
      const path = `${filePath}.${extension}`;
      setModalData({
        data: {
          file,
          path,
          onClose: async (metadata: any) => {
            const video = {
              ...metadata,
              path: `${path}?ts=${generateId()}`,
              type,
            };
            setVideo(video);
            videoRef.current?.load();
            reset({ ...getValues(), video });
            autoSave(name, video);
          },
          toast,
        },
      });
      setModalView("VIDEO_UPLOAD_VIEW");
      openModal();
    }
  }

  const labelKey = `forms:label-${name}`;
  const videoClassName =
    "mb-3 md:mb-3.5 object-contain rounded-s-md w-full rounded-md transition duration-200 ease-in";
  return (
    <div
      className="mb-8 group box-border overflow-hidden flex rounded-md pe-0 pb-2 lg:pb-3 flex-col items-start bg-primary transition duration-200 ease-in-out"
      title={t(labelKey)}
    >
      {video ? (
        <video
          poster={getPoster(video)}
          ref={videoRef}
          muted={true}
          preload="none"
          className={videoClassName}
          controls
          playsInline
        >
          <source type={video?.type} src={getOriginal(video)} />
        </video>
      ) : (
        <img
          src={"/assets/placeholder/idol-video.jpeg"}
          className={videoClassName}
          alt={t(labelKey)}
        />
      )}
      <a
        onClick={() => input.current?.click()}
        className="text-[13px] md:text-sm leading-4 inline-flex items-center cursor-pointer transition ease-in-out duration-300 font-semibold font-body text-center justify-center border-0 border-transparent rounded-md placeholder-white focus-visible:outline-none focus:outline-none bg-heading text-white px-5 md:px-6 lg:px-8 py-4 md:py-3.5 lg:py-4 hover:text-white hover:bg-gray-600 hover:shadow-cart h-12 w-full "
      >
        {t(labelKey)}
      </a>
      <input
        className="hidden"
        type="file"
        accept="video/*"
        onChange={startUploading}
        ref={input}
      />
    </div>
  );
};

export default VideoInput;
