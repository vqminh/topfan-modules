import { motion } from "framer-motion";
import { fadeInOut } from "../../motion/fade-in-out";
import { useUI } from "src/contexts/ui.context";
import { IoClose, IoStop } from "react-icons/io5";
import { useTranslation } from "next-i18next";
import React, { useEffect, useRef, useState } from "react";
import { reportError } from "../../utils/logging";
import { uploadFile } from "../../utils/storage";
import { VideoType } from "src/framework/basic-rest/booking-types";
import Button from "../../ui/button";
import cn from "classnames";
import { getSupportedMimeType } from "../../utils/video";
import styles from "./VideoRecorder.module.css";
import { useInterval } from "react-use";
import {RESPONSE_SIZE} from "../../utils/env";

/**
 * https://developers.google.com/web/updates/2016/01/mediarecorder
 * @constructor
 */
export default function VideoRecorder() {
  const { t } = useTranslation("common");
  const {
    closeDrawer,
    drawerData: { data },
  } = useUI();
  const gum = useRef<HTMLVideoElement>(null);
  const { path, title, description, onClose } = data;
  const [loading, setLoading] = useState(false);
  const [percent, setPercent] = useState(100);
  const [recording, setRecording] = useState(false);
  const [recorded, setRecorded] = useState(false);
  const [startTime, setStartTime] = useState(Date.now());
  const [timer, setTimer] = useState("00:00");
  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const recordedBlobs = useRef<Blob[]>([]);
  const mediaStream = useRef<MediaStream | null>(null);

  async function startCamera() {
    if (!mediaStream.current) {
      mediaStream.current = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: { exact: true },
        },
        video: true,
      });
    }

    if (!mediaRecorder.current) {
      const mimeType = getSupportedMimeType() || "";

      mediaRecorder.current = new MediaRecorder(mediaStream.current, {
        mimeType,
      });
      mediaRecorder.current.onstop = async () => {
        if (gum.current) {
          const { type } = recordedBlobs.current[0];
          const superBuffer = new Blob(recordedBlobs.current, {
            type,
          });
          gum.current.src = "";
          gum.current.srcObject = null;
          gum.current.src = URL.createObjectURL(superBuffer);
          gum.current.controls = true;
          gum.current.autoplay = true;
          gum.current.muted = false;
        }
      };
      mediaRecorder.current.ondataavailable = (event) => {
        recordedBlobs.current.push(event.data);
        setRecorded(true);
      };
    }

    if (gum.current) {
      gum.current.src = "";
      gum.current.srcObject = mediaStream.current;
      gum.current.controls = false;
      gum.current.autoplay = true;
      gum.current.muted = true;
    }
  }

  async function startRecording() {
    try {
      await startCamera();
      setStartTime(Date.now());

      if (mediaRecorder.current) {
        setRecorded(false);
        recordedBlobs.current = [];
        mediaRecorder.current.start();
      }
    } catch (e: any) {
      reportError(e);
    }
  }

  useInterval(
    () => {
      function padZero(val: number) {
        return val.toString().padStart(2, "0");
      }

      let elapsedSeconds = Math.floor((Date.now() - startTime) / 1000);
      setTimer(
        () =>
          padZero(Math.floor(elapsedSeconds / 60)) +
          ":" +
          padZero(elapsedSeconds % 60)
      );
    },
    recording ? 1000 : null
  );

  function stopRecording() {
    if (mediaRecorder.current && mediaRecorder.current?.state === "recording") {
      mediaRecorder.current.stop();
    }
    if (gum.current?.src) {
      URL.revokeObjectURL(gum.current?.src);
    }
    // stop camera
    mediaStream.current?.getTracks()?.forEach((track) => track.stop());
    mediaStream.current = null;
    mediaRecorder.current = null;
  }

  useEffect(() => {
    if (window.MediaRecorder) {
      startCamera().catch(reportError);
    } else {
      const message = "Chình duyệt của bạn không có chức năng thu video";
      reportError(message, navigator.userAgent);
      throw new Error(message);
    }
    return stopRecording;
  }, []);

  async function save() {
    setLoading(true);
    const { type } = recordedBlobs.current[0];
    const blob = new Blob(recordedBlobs.current);
    await uploadFile(blob, path, setPercent);
    await onClose({
      type,
    } as VideoType);
    setLoading(false);
    closeDrawer();
  }

  return (
    <div className="bg-primary flex flex-col w-full h-full justify-between overflow-hidden">
      <div className="w-full flex flex-col justify-between items-end relative border-b border-gray-100">
        <button
          className="flex text-2xl items-center justify-center text-gray-500 p-4 md:p-5 lg:p-5 focus:outline-none transition-opacity hover:opacity-60"
          onClick={closeDrawer}
          aria-label="close"
        >
          <IoClose className="text-black mt-1 md:mt-0.5" />
        </button>
      </div>
      <div className="flex flex-col items-center">
        <span
          className="absolute break-words text-lg text-center text-white z-20 font-bold px-5 py-5 bg-black bg-opacity-25 w-full"
          hidden={recorded}
          dangerouslySetInnerHTML={{
            __html: title + description,
          }}
        />
      </div>

      <motion.div
        layout
        initial="from"
        animate="to"
        exit="from"
        variants={fadeInOut(0.25)}
        className="h-full overflow-hidden"
      >
        <video
          className={`w-full h-full z-10 object-contain max-h-full ${
            recorded ? "" : styles.videoInput
          }`}
          ref={gum}
          width={RESPONSE_SIZE.width}
          height={RESPONSE_SIZE.height}
          playsInline
        />
      </motion.div>

      <div className="flex flex-col px-5 md:px-7 pt-2">
        <div className="flex items-center justify-between mb-4 space-s-3 sm:space-s-4">
          <Button
            onClick={async () => {
              setRecording(!recording);
              if (recording) {
                stopRecording();
              } else {
                await startRecording();
              }
            }}
            disabled={loading}
            className={cn("w-full h-11 md:h-12 px-1.5", {
              "bg-red-600": recording,
              "cursor-not-allowed bg-gray-400 hover:bg-gray-400": loading,
            })}
          >
            {recording ? (
              <>
                <IoStop />
                <p className="ml-2.5 font-bold text-lg text-white">{timer}</p>
              </>
            ) : (
              t("button-start-recording")
            )}
          </Button>
          <Button
            onClick={save}
            loading={loading}
            disabled={loading || recording || !recorded}
            variant="flat"
            percentage={percent}
            className={cn("w-full h-11 md:h-12 px-1.5", {
              hidden: recording,
              "cursor-not-allowed bg-gray-400 hover:bg-gray-400": !recorded,
              "bg-green-400": recorded,
            })}
          >
            {t("button-sent-to-fan")}
          </Button>
        </div>
      </div>
    </div>
  );
}
