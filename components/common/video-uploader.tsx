import React, { useEffect, useState } from "react";
import { useUI } from "../../../src/contexts/ui.context";
import Button from "../../ui/button";
import { useTranslation } from "next-i18next";
import { getImageFromVideo, uploadFile } from "../../utils/storage";
import { VideoType } from "../../../src/framework/basic-rest/booking-types";
import { toast } from "react-toastify";

/**
 * https://github.com/fengyuanchen/cropperjs/blob/master/docs/examples/full-crop-box.html
 * https://fengyuanchen.github.io/cropperjs/
 * @constructor
 */
export default function VideoUploader() {
  const { t } = useTranslation("common");
  const {
    modalData: { data },
    closeModal,
  } = useUI();
  const { file, path, onClose, toast: runInBackground } = data;
  const [loading, setLoading] = useState(false);
  const [url, setUrl] = useState("");
  const [percent, setPercent] = useState(100);
  const [metadata, setMetadata] = useState<Partial<VideoType>>();
  const [poster, setPoster] = useState<Blob>();
  const type = file.type;

  useEffect(() => {
    setUrl(URL.createObjectURL(file));
    return () => URL.revokeObjectURL(url);
  }, [file]);

  function updateProgress(percent: number) {
    if (runInBackground) {
      if (percent > 0 && percent < 100) {
        toast.update(path, { progress: percent / 100 });
      }
    } else {
      setPercent(percent);
    }
  }

  async function save() {
    if (runInBackground) {
      closeModal();
      toast(t("text-loading"), {
        toastId: path,
        progress: 0.01,
      });
      await doUploadFile();
    } else {
      setLoading(true);
      await doUploadFile();
      setLoading(false);
      closeModal();
    }

    async function doUploadFile() {
      await uploadFile(file, path, updateProgress);
      if (poster) {
        const i = path.lastIndexOf(".");
        await uploadFile(poster, `${path.substring(0, i)}.jpg`);
      }
      toast.update(path, {
        render: t("text-loading-done"),
        progress: 1,
        type: "success",
      });
      await onClose(metadata);
    }
  }

  return (
    <div className="rounded-lg bg-primary">
      <div className="flex flex-col lg:flex-row w-full md:w-[650px] lg:w-[960px] mx-auto overflow-hidden">
        <div className="flex-shrink-0 flex items-center justify-center w-full lg:w-430px lg:max-h-full overflow-hidden bg-gray-300">
          <video
            className="lg:object-cover lg:w-full lg:h-full"
            controls
            onLoadedMetadata={(event) => {
              const video = event.currentTarget;
              const { duration, videoHeight, videoWidth } = video;
              setMetadata({ duration, videoHeight, videoWidth });
              video.currentTime = 1;
            }}
            onTimeUpdate={(event) => {
              const canvas = getImageFromVideo(
                event.currentTarget,
                650
              );
              canvas.toBlob(
                (blob) => {
                  if (blob) {
                    setPoster(blob);
                  }
                },
                "image/jpeg",
                0.95
              );
            }}
          >
            <source type={type} src={url} />
          </video>
        </div>

        <div className="flex flex-col p-5 md:p-8 w-full">
          <div className="pb-5">
            <p className="text-sm leading-6 md:text-body md:leading-7">
              Bạn hãy kiểm tra Video trước khi bấm nút Gửi cho Fan
            </p>
          </div>

          <div className="pt-2 md:pt-4">
            <Button
              onClick={save}
              loading={loading}
              disabled={loading}
              percentage={percent}
              variant="flat"
              className="w-full h-11 md:h-12"
            >
              {t("button-sent-to-fan")}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
