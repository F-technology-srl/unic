import { useEffect, useRef, useState } from 'react';

export interface AudioProps {
  media_repository_asset_uuid?: string | null;
  goToSecond?: number | null;
}

export const Audio = (props: AudioProps) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  useEffect(() => {
    setAudioUrl(
      window.location.origin +
        `/api/repository_assets/${props.media_repository_asset_uuid}`,
    );
  }, [props.media_repository_asset_uuid]);

  useEffect(() => {
    if (audioRef.current && audioUrl) {
      audioRef.current.load();
    }
  }, [audioUrl]);

  useEffect(() => {
    goToTime(props.goToSecond);
  }, [props.goToSecond]);

  const goToTime = (seconds?: number | null) => {
    if (
      audioRef.current &&
      seconds !== undefined &&
      seconds !== null &&
      seconds !== -1
    ) {
      audioRef.current.currentTime = seconds;
      audioRef.current.play();
    }
    if (seconds === -1) {
      audioRef.current?.pause();
    }
  };

  return (
    <div className="flex flex-row justify-left items-center gap-2 ">
      {props.media_repository_asset_uuid && (
        <audio controls ref={audioRef} className="w-full">
          <source src={audioUrl ?? ''} type="audio/mp4"></source>
          Your browser not support audio.
        </audio>
      )}
    </div>
  );
};

export default Audio;
