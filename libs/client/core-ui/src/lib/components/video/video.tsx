import { useEffect, useRef, useState } from 'react';

export interface VideoProps {
  media_repository_asset_uuid?: string | null;
  goToSecond?: number | null;
}

export const Video = (props: VideoProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  useEffect(() => {
    setVideoUrl(
      window.location.origin +
        `/api/repository_assets/${props.media_repository_asset_uuid}`,
    );
  }, [props.media_repository_asset_uuid]);

  useEffect(() => {
    if (videoRef.current && videoUrl) {
      videoRef.current.load();
    }
  }, [videoUrl]);

  useEffect(() => {
    goToTime(props.goToSecond);
  }, [props.goToSecond]);

  const goToTime = (seconds?: number | null) => {
    if (
      videoRef.current &&
      seconds !== undefined &&
      seconds !== null &&
      seconds !== -1
    ) {
      videoRef.current.currentTime = seconds;
      videoRef.current.play();
    }
    if (seconds === -1) {
      videoRef.current?.pause();
    }
  };

  return (
    <div className="flex flex-row justify-left items-center gap-2">
      {props.media_repository_asset_uuid && (
        <video controls ref={videoRef} className="max-w-[1000px] w-full">
          <source src={videoUrl ?? ''} type="video/mp4"></source>
          Your browser not support video.
        </video>
      )}
    </div>
  );
};

export default Video;
