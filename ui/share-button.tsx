import React, { FC, PropsWithChildren } from "react";
import { IoMdShare as ShareIcon } from "react-icons/io";
import { LOGGER, reportError } from "../utils/logging";
import { useCopyToClipboard } from "react-use";
import { toast } from "react-toastify";
import { useTranslation } from "next-i18next";

export interface ShareProps {
  className?: string;
  title?: string;
  text?: string;
  url?: string;
  btnClassName?: string;
}

const ShareButton: FC<PropsWithChildren<ShareProps>> = ({
  title = "TOPFAN - Chia Sẻ Niềm Vui",
  text,
  url = "",
  className = "",
  btnClassName = "",
  children,
}) => {
  const [state, copyToClipboard] = useCopyToClipboard();
  const { t } = useTranslation("common");

  function toggleShare() {
    if (navigator && navigator.share) {
      navigator.share({ title, text, url }).catch(reportError);
    } else {
      copyToClipboard(url);
      toast.success(t("text-share-link-copied"), { hideProgressBar: true });
      LOGGER(state);
    }
  }

  return (
    <div className={className}>
      <a
        onClick={toggleShare}
        className={`inline-flex cursor-pointer ${btnClassName}`}
      >
        <ShareIcon /> {children}
      </a>
    </div>
  );
};

export default ShareButton;
