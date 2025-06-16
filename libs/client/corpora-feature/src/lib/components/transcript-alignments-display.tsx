import React, { useState, useEffect } from 'react';
import { AlignmentsData } from '@unic/shared/corpora-dto';
import { PlayIcon, StopIcon } from '@unic/core-ui';
import { setWordInBold } from '../utils';

export interface TranscriptAlignmnetsDisplayProps {
  alignmnets?: AlignmentsData[] | null;
  onAlignmentClick?: (id: string, secondsToGo: number | null) => void;
  alignmentIsPlaying?: string | null;
  alignmentSelected?: string | null;
  offset?: number;
  offsetLength?: number;
  displayButton?: boolean;
}

export const TranscriptAlignmnetsDisplay = (
  props: TranscriptAlignmnetsDisplayProps,
) => {
  useEffect(() => {
    const elemento = document.getElementById(`${props.alignmentSelected}`);
    if (elemento) {
      elemento.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [props.alignmentSelected]);

  return (
    <div>
      <div className="max-h-[350px] overflow-y-auto scrollbar">
        {props.alignmnets?.map((alignment) => {
          const idAlignment = alignment.alignment_uuid;

          function getTextToShow() {
            if (props.alignmentSelected === idAlignment) {
              return setWordInBold({
                full_text: alignment.full_text ?? '',
                offset: props.offset,
                offsetLength: props.offsetLength,
              });
            } else {
              return alignment.full_text;
            }
          }

          function getButtonVideo() {
            if (props.alignmentIsPlaying === idAlignment) {
              return (
                <StopIcon
                  isSelected={props.alignmentSelected === idAlignment}
                />
              );
            } else {
              return (
                <PlayIcon
                  isSelected={props.alignmentSelected === idAlignment}
                />
              );
            }
          }

          return (
            <div key={idAlignment} id={idAlignment} className="flex mb-5 ">
              {props.displayButton && (
                <button
                  className="mr-5"
                  onClick={() => {
                    props.onAlignmentClick &&
                      props.onAlignmentClick(
                        idAlignment,
                        Number(alignment.start),
                      );
                  }}
                >
                  {getButtonVideo()}
                </button>
              )}
              <p
                className="sm-normal text-gray-500"
                dangerouslySetInnerHTML={{
                  __html: getTextToShow() ?? '',
                }}
              ></p>
            </div>
          );
        })}
      </div>
    </div>
  );
};
