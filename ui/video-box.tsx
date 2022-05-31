import {
  IoMdExpand,
  IoMdPause,
  IoMdPlay,
  IoMdVolumeHigh,
  IoMdVolumeOff,
} from "react-icons/io";
import React, { FC, SyntheticEvent, useEffect, useState } from "react";
import { useVideo, useFullscreen, useToggle } from "react-use";
import cn from "classnames";
import { useUI } from "@contexts/ui.context";

export interface VideoProps
  extends React.VideoHTMLAttributes<HTMLVideoElement> {
  videoId: string;
  fullscreen?: boolean;
}

const VideoBox: FC<VideoProps> = (props) => {
  const {
    videoId,
    children,
    className,
    poster,
    muted = true,
    autoPlay = true,
    fullscreen = false,
    preload = "auto",
    loop = false,
    playsInline = true,
  } = props;
  const { playingVideo, setPlayVideo } = useUI();
  const [video, state, controls] = useVideo(
    <video
      poster={poster}
      muted={muted}
      autoPlay={autoPlay}
      preload={preload}
      loop={loop}
      style={{
        objectFit: "contain",
        objectPosition: "center",
        background: "none",
      }}
      className={className + " z-10"}
      controls={false}
      playsInline={playsInline}
      onClick={togglePause}
    >
      {children}
    </video>
  );

  useEffect(() => {
    if (playingVideo !== videoId) {
      if (!pause) {
        togglePause();
      }
    }
  }, [playingVideo]);
  const [mute, setMute] = useState(muted);
  const [pause, setPause] = useState(!autoPlay);
  const [full, toggleFull] = useToggle(false);
  // @ts-ignore
  useFullscreen(video.ref, full, {
    onClose: () => {
      toggleFull(false);
    },
  });

  useEffect(() => {
    setMute(state.muted);
    setPause(state.paused);
  }, [video, state]);

  function toggleMute(e: SyntheticEvent) {
    e.stopPropagation();
    mute ? controls.unmute() : controls.mute();
    setMute(!mute);
  }

  function goFullscreen() {
    toggleFull();
  }

  function togglePause() {
    if (pause) {
      controls.play();
      setPlayVideo(videoId);
    } else {
      controls.pause();
    }
    setPause(!pause);
  }

  return (
    <div
      className="relative flex flex-col justify-center w-full h-full align-center bg-none rounded-md aspect9_16 overflow-hidden"
      onClick={togglePause}
    >
      <div
        className="z-0 w-full h-full absolute blurred blurred-none-if-not-supported rounded-md"
        style={{
          backgroundImage: `url(${poster})`,
        }}
      />
      {video}
      {fullscreen && (
        <IoMdExpand
          stroke="black"
          strokeWidth={5}
          className="text-accent text-2xl absolute top-2.5 right-2.5 z-20 cursor-pointer drop-shadow-md"
          onClick={goFullscreen}
        />
      )}
      <IoMdVolumeOff
        stroke="black"
        strokeWidth={5}
        className={cn(
          "text-white text-2xl absolute bottom-2.5 right-2.5 z-20 cursor-pointer drop-shadow-md",
          {
            hidden: !mute,
          }
        )}
        onClick={toggleMute}
      />
      <IoMdVolumeHigh
        stroke="black"
        strokeWidth={5}
        className={cn(
          "text-white text-2xl absolute bottom-2.5 right-2.5 z-20 cursor-pointer drop-shadow-md",
          {
            hidden: mute,
          }
        )}
        onClick={toggleMute}
      />
      <IoMdPlay
        stroke="black"
        strokeWidth={5}
        className={cn(
          "text-white text-2xl absolute top-2.5 left-2.5 z-20 cursor-pointer drop-shadow-md",
          {
            hidden: !pause,
          }
        )}
        onClick={togglePause}
      />
      <IoMdPause
        stroke="black"
        strokeWidth={5}
        className={cn(
          "text-white text-2xl absolute top-2.5 left-2.5 z-20 cursor-pointer drop-shadow-md",
          {
            hidden: pause,
          }
        )}
        onClick={togglePause}
      />
    </div>
  );
};

export default VideoBox;
