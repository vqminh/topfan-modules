import type { FC } from "react";
import React, { ChangeEvent, useRef, useState } from "react";
import { useUI } from "../../src/contexts/ui.context";
import { useTranslation } from "next-i18next";
import { PhotoType } from "../../src/framework/basic-rest/booking-types";
import { generateId, getBucketURL } from "../utils/id";
import {PLACE_HOLDER} from "../utils/env";

interface ImageInputProps {
  name: string;
  filePath: string;
  className?: string;
  value?: PhotoType;
  autoSave: (name: string, values: PhotoType) => Promise<any> | undefined;
}

const ImageInput: FC<ImageInputProps> = ({
  name,
  filePath,
  autoSave,
  value,
  className,
}) => {
  const { openModal, setModalView, setModalData } = useUI();
  const input = useRef<HTMLInputElement>(null);
  // LOGGER(defaultValue, ts)
  const [src, setSrc] = useState(value?.path ? getUrl(value.path) : PLACE_HOLDER);
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
          aspectRatio: 1,
          path,
          onClose: async (canvas: HTMLCanvasElement) => {
            setSrc(canvas.toDataURL(type));
            await autoSave(name, {
              path: `${path}?ts=${generateId()}`,
              type,
              width: canvas.width,
              height: canvas.height,
            });
          },
        },
      });
      setModalView("IMAGE_CROPPER_VIEW");
      openModal();
    }
  }

  const labelKey = `forms:label-${name}`;

  function getUrl(src: string) {
    return src === PLACE_HOLDER || src.startsWith("data:image")
      ? src
      : getBucketURL(src);
  }

  return (
    <div
      className={`${className} mb-8 group box-border overflow-hidden flex rounded-md cursor-pointer pe-0 pb-2 lg:pb-3 flex-col items-start bg-primary transition duration-200 ease-in-out transform hover:-translate-y-1 hover:md:-translate-y-1.5 hover:shadow-product`}
      onClick={() => input.current?.click()}
      role="button"
      title={t(labelKey)}
    >
      <img
        src={src}
        loading="lazy"
        alt={t(labelKey)}
        className="bg-gray-300 object-cover rounded-s-md w-full rounded-md transition duration-200 ease-in group-hover:rounded-b-none mb-3 md:mb-3.5"
        onError={() => setSrc(PLACE_HOLDER)}
      />
      <div className="w-full overflow-hidden ps-0 lg:ps-2.5 xl:ps-4 pe-2.5 xl:pe-4">
        <h2 className="text-heading font-semibold truncate mb-1 text-sm md:text-base">
          {t(labelKey)}
        </h2>
        <p className="text-body text-xs lg:text-sm leading-normal xl:leading-relaxed max-w-[250px] truncate">
          Nhấn để tải lên
        </p>
      </div>
      <input
        className="hidden"
        type="file"
        accept="image/*"
        onChange={startUploading}
        ref={input}
      />
    </div>
  );
};

export default ImageInput;
