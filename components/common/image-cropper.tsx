import React, { useEffect, useRef, useState } from "react";
import { useUI } from "../../../src/contexts/ui.context";
import Button from "../../ui/button";
import { useTranslation } from "next-i18next";
import Cropper from "cropperjs";
import { uploadFile } from "../../utils/storage";
import "cropperjs/dist/cropper.min.css";
import { MAX_IMAGE_SIZE } from "../../utils/id";

/**
 * https://github.com/fengyuanchen/cropperjs/blob/master/docs/examples/full-crop-box.html
 * https://fengyuanchen.github.io/cropperjs/
 * @constructor
 */
export default function ImageCropper() {
  const { t } = useTranslation("common");
  const {
    modalData: { data },
    closeModal
  } = useUI();
  const { file, path, onClose, aspectRatio } = data;
  const container = useRef<HTMLImageElement>(null);
  let cropper: Cropper;
  const [percent, setPercent] = useState(100);
  const [loading, setLoading] = useState(false);
  const [url] = useState(URL.createObjectURL(file));

  const { type } = file;

  useEffect(() => {
    let current = container.current as HTMLImageElement;
    cropper = new Cropper(current, {
      aspectRatio,
      viewMode: 3,
      dragMode: "move",
      autoCropArea: 1,
      cropBoxResizable: false,
      toggleDragModeOnDblclick: false
    });
    return () => {
      URL.revokeObjectURL(url);
      cropper.destroy();
    };
  }, []);

  async function save() {
    setLoading(true);
    const canvas = cropper.getCroppedCanvas({
      maxHeight: MAX_IMAGE_SIZE,
      maxWidth: MAX_IMAGE_SIZE,
    });
    await new Promise((resolve, reject) => {
      canvas.toBlob(async blob => {
        if (blob) {
          await uploadFile(blob, path, setPercent);
          resolve(null);
        } else {
          reject(new Error("Could not convert to blob"));
        }
      }, type);
    });
    await onClose(canvas);
    setLoading(false);
    closeModal();
    cropper.destroy();
  }

  return (
    <div className="rounded-lg bg-primary">
      <div className="flex flex-col lg:flex-row w-full md:w-[650px] lg:w-[960px] mx-auto overflow-hidden">
        <div
          className="flex-shrink-0 flex items-center justify-center w-full lg:w-430px max-h-430px lg:max-h-full overflow-hidden bg-gray-300">
          <img
            src={url}
            ref={container}
            className="lg:object-cover lg:w-full lg:h-full"
            alt="Kéo thả để cắt ảnh" />
        </div>

        <div className="flex flex-col p-5 md:p-8 w-full">
          <div className="pb-5">
            <p className="text-sm leading-6 md:text-body md:leading-7">
              Kéo thả để cắt ảnh
            </p>
          </div>

          <div className="pt-2 md:pt-4">
            <Button
              onClick={save}
              loading={loading}
              variant="flat"
              className="w-full h-11 md:h-12"
              percentage={percent}
            >
              {t("button-save")}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
