import type { FC } from "react";
import React, { ChangeEvent, useRef } from "react";
import { useUI } from "@contexts/ui.context";
import { useTranslation } from "next-i18next";
import { generateId } from "../utils/id";
import { VideoType } from "src/framework/basic-rest/booking-types";
import Button, { ButtonProps } from "./button";

interface VideoUploadBtnProps extends ButtonProps{
  name: string;
  filePath: string;
  afterUpload: (name: string, value: VideoType) => Promise<any> | undefined;
}

const VideoUploadButton: FC<VideoUploadBtnProps> = ({name, filePath, afterUpload , ...rest}) => {
  const { openModal, setModalView, setModalData } = useUI();
  const input = useRef<HTMLInputElement>(null);
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
              type
            };
            afterUpload(name, video);
          }
        }
      });
      setModalView("VIDEO_UPLOAD_VIEW");
      openModal();
    }
  }


  return (
    <>
      <Button
        onClick={() => input.current?.click()}
        variant="flat"
        {...rest}
      >
        {t("button-upload")}
      </Button>
      <input
        className="hidden"
        type="file"
        accept="video/*"
        onChange={startUploading}
        ref={input}
      />
    </>

  );
};

export default VideoUploadButton;
