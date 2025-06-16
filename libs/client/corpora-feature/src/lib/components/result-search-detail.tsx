import { useRef, useState } from 'react';
import { Button, Checkbox, Loader, ModalHandle } from '@unic/core-ui';
import { TranscriptInfoDisplay } from './transcript-info-display';
import { capitalizeFirstLetter } from '@unic/shared/global-types';
import { getNameLanguageFromId } from '@unic/shared/database-dto';
import { useGetTranscriptDetailInfo } from '../data-access';
import { useStore } from '@nanostores/react';
import { currentUserLoggedAtom } from '@unic/client-user-feature';
import { DownloadModal } from './download-modal';

export interface ResultSearchDetailProps {
  corpora_slug: string;
  transcript_slug: string;
  alignment_slug?: string;
  offset?: number;
  offsetLength?: number;
  wordSearch?: string;
}

export const ResultSearchDetail = (props: ResultSearchDetailProps) => {
  const [slugSecondTranscript, setSlugSecondTranscript] = useState<
    string | null | undefined
  >(null);

  const currentUserLogged = useStore(currentUserLoggedAtom);

  const { data: transcriptData, isLoading: transcriptDataLoading } =
    useGetTranscriptDetailInfo(props.corpora_slug, props.transcript_slug);

  const { data: secondTranscriptData, isLoading: secondTranscriptDataLoading } =
    useGetTranscriptDetailInfo(props.corpora_slug, slugSecondTranscript);

  const downloadRef = useRef<ModalHandle>(null);

  const classNameColumn = `grid gap-10  ${secondTranscriptData ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1'} `;

  const otherTranscripts = [
    ...[transcriptData?.sourceTranscript],
    ...(transcriptData?.targetsTranscript ?? []),
  ].filter((transcript) => transcript !== null);

  if (transcriptDataLoading || secondTranscriptDataLoading) {
    return <Loader></Loader>;
  }

  return (
    <>
      <div className="mx-auto max-w-[1280px] flex gap-5 md:gap-14 my-5 md:my-14 bg-white p-10  shadow-sm rounded-md border-1 border-slate-50">
        <div className="grid grid-cols-1 w-full">
          <div className="flex justify-between items-center py-5 border-b border-solid border-gray-200">
            <p className="  text-2xl font-bold">
              {capitalizeFirstLetter(transcriptData?.text_id)}
            </p>
            {currentUserLogged?.user_uuid && (
              <Button
                type="primary"
                size="regular"
                onClick={() => {
                  downloadRef.current?.toggleState();
                }}
              >
                Download
              </Button>
            )}
          </div>
          <div className="mt-8">
            {props.wordSearch && (
              <p className="text-lg font-semibold text-gray-900">
                Showing results for “
                <span className="italic">{props.wordSearch}</span>”
              </p>
            )}

            {otherTranscripts && (
              <div className="mt-4 mb-4">
                <h3 className="text-sm font-medium mb-3.5">
                  Show the corresponding source/target:
                </h3>
                <div className="flex flex-wrap gap-y-4  gap-x-10 mt-2">
                  <Checkbox
                    name="transcript-no"
                    label="No"
                    checked={!slugSecondTranscript}
                    onCheckedChange={() => setSlugSecondTranscript(null)}
                  />
                  {otherTranscripts.map((transcript) => {
                    //TODO cambiare con input singola
                    return (
                      <Checkbox
                        key={'transcript-' + transcript?.transcript_uuid}
                        name={transcript?.transcript_uuid ?? ''}
                        label={
                          getNameLanguageFromId(transcript?.language?.[0]) ??
                          transcript?.slug ??
                          transcript?.text_id ??
                          ''
                        }
                        checked={slugSecondTranscript === transcript?.slug}
                        onCheckedChange={() =>
                          setSlugSecondTranscript(transcript?.slug)
                        }
                      />
                    );
                  })}
                </div>
              </div>
            )}
          </div>
          <div className={classNameColumn}>
            {transcriptData && (
              <div>
                <TranscriptInfoDisplay
                  transcriptData={transcriptData}
                  isFirstColumn
                  slugAlignmnetSelected={props.alignment_slug}
                  offset={props.offset}
                  offsetLength={props.offsetLength}
                ></TranscriptInfoDisplay>
              </div>
            )}
            {secondTranscriptData && (
              <div>
                <TranscriptInfoDisplay
                  transcriptData={secondTranscriptData}
                  isFirstColumn={false}
                  slugAlignmnetSelected={props.alignment_slug}
                ></TranscriptInfoDisplay>
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="mx-auto max-w-[1280px] bg-green-50 p-5 text-center shadow-sm rounded-md border-1 border-slate-50">
        <span className="text-sm font-normal text-gray-900 px-5">
          If you are the speaker, signer, or interpreter in any interpreting
          events on UNIC and don’t want your data to be freely available for
          research purposes, contact the UNIC team at{' '}
          <a
            href="mailto:unic@dipintra.it"
            className="text-blue-800 hover:underline"
          >
            unic@dipintra.it
          </a>
          , and we will remove your data from UNIC.
        </span>
      </div>
      <DownloadModal
        submitRef={downloadRef}
        transcripts={
          transcriptData
            ? [
                {
                  text_id: transcriptData?.text_id ?? '',
                  corpora_uuid: transcriptData?.corpora_uuid,
                  word_found: props.wordSearch,
                  offset: props.offset,
                  offset_length: props.offsetLength,
                  alignment_slug: props.alignment_slug,
                },
                ...(secondTranscriptData
                  ? [
                      {
                        text_id: secondTranscriptData?.text_id ?? '',
                        corpora_uuid: secondTranscriptData?.corpora_uuid,
                        word_found: props.wordSearch,
                        offset: props.offset,
                        offset_length: props.offsetLength,
                        alignment_slug: props.alignment_slug,
                      },
                    ]
                  : []),
              ]
            : []
        }
      ></DownloadModal>
    </>
  );
};
