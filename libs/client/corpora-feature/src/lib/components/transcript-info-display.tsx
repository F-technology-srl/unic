import React, { useState, useEffect } from 'react';
import { TranscriptData } from '@unic/shared/corpora-dto';
import { Video, Audio } from '@unic/core-ui';
import { TranscriptAlignmnetsDisplay } from './transcript-alignments-display';
import { TranscriptTextDisplay } from './transcript-text-display';

export interface TranscriptInfoDisplayProps {
  transcriptData: TranscriptData;
  slugAlignmnetSelected?: string | null;
  isFirstColumn: boolean;
  offset?: number;
  offsetLength?: number;
}

export const TranscriptInfoDisplay = (props: TranscriptInfoDisplayProps) => {
  const [secondsMedia, setSecondsMedia] = useState<number | null>(null);
  const [idAlignmentSelected, setIdAlignmentsSelected] = useState<
    string | null | undefined
  >(null);
  const [idAlignmnetIsPlaying, setIdAlignmnetIsPlaying] = useState<
    string | null | undefined
  >(null);

  useEffect(() => {
    let alignmentUuidToSelect: string | null | undefined = '';
    if (props.isFirstColumn) {
      alignmentUuidToSelect = props.transcriptData?.alignmnets?.find(
        (align) => align.slug === props.slugAlignmnetSelected,
      )?.alignment_uuid;
    } else {
      alignmentUuidToSelect = props.transcriptData?.alignmnets?.find(
        (align) => align.source_id === props.slugAlignmnetSelected,
      )?.alignment_uuid;
    }
    setIdAlignmentsSelected(alignmentUuidToSelect);
  }, [props.transcriptData, props.slugAlignmnetSelected, props.isFirstColumn]);

  return (
    <div className="mx-auto max-w-[1280px] flex mt-5">
      <div className="w-full">
        {props.transcriptData.media_file?.mime_type === 'video/mp4' && (
          <Video
            media_repository_asset_uuid={
              props.transcriptData?.media_repository_asset_uuid
            }
            goToSecond={secondsMedia}
          ></Video>
        )}

        {props.transcriptData.media_file?.mime_type !== 'video/mp4' && (
          <Audio
            media_repository_asset_uuid={
              props.transcriptData?.media_repository_asset_uuid
            }
            goToSecond={secondsMedia}
          ></Audio>
        )}

        <h1 className="text-xs font-medium text-gray-900 mt-5 mb-5">
          Transcript ID:{' '}
          {props.transcriptData?.text_id ?? props.transcriptData?.slug ?? ''}
        </h1>

        {(props.transcriptData.alignmnets?.length ?? 0) > 0 &&
        props.slugAlignmnetSelected ? (
          <TranscriptAlignmnetsDisplay
            alignmnets={props.transcriptData?.alignmnets}
            onAlignmentClick={(idAlignment, secondsToGo) => {
              let secondToSet = secondsToGo;
              setIdAlignmnetIsPlaying(idAlignment);
              if (idAlignmnetIsPlaying === idAlignment) {
                secondToSet = -1;
                setIdAlignmnetIsPlaying(null);
              }
              setSecondsMedia(null);
              setTimeout(() => {
                setSecondsMedia(secondToSet);
              }, 100);
            }}
            alignmentSelected={idAlignmentSelected}
            alignmentIsPlaying={idAlignmnetIsPlaying}
            offset={props.offset}
            offsetLength={props.offsetLength}
            displayButton={
              props.transcriptData?.media_repository_asset_uuid ? true : false
            }
          ></TranscriptAlignmnetsDisplay>
        ) : (
          <TranscriptTextDisplay
            full_text={props.transcriptData?.full_text ?? ''}
            offset={props.offset}
            offsetLength={props.offsetLength}
          ></TranscriptTextDisplay>
        )}
      </div>
    </div>
  );
};
