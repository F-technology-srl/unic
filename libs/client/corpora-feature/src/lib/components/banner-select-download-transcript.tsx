import { useStore } from '@nanostores/react';
import { resultSelectedAtom } from './detailed-results';
import { Button, ModalHandle, XIcon } from '@unic/core-ui';
import { useEffect, useRef, useState } from 'react';
import { currentUserLoggedAtom } from '@unic/client-user-feature';
import { DownloadModal } from './download-modal';

export interface BannerSelectDownloadTranscriptProps {
  onDownload?: () => void;
}

export const BannerSelectDownloadTranscript = (
  props: BannerSelectDownloadTranscriptProps,
) => {
  const $resultSelectedAtom = useStore(resultSelectedAtom);
  const [closeBanner, setCloseBanner] = useState(false);

  const [numberOfSelection] = useState(0);

  const downloadRef = useRef<ModalHandle>(null);
  const currentUserLogged = useStore(currentUserLoggedAtom);

  useEffect(() => {
    if (numberOfSelection !== $resultSelectedAtom?.length) {
      setCloseBanner(false);
    }
  }, [$resultSelectedAtom?.length, numberOfSelection]);

  if (($resultSelectedAtom?.length ?? 0) <= 0) {
    return null;
  }

  if (closeBanner) {
    return null;
  }

  return (
    <>
      <div className="fixed bottom-0 bg-transparent left-0 w-full flex max-w-[918px] left-1/2 -translate-x-1/2 -translate-y-1/2">
        <div className=" px-8 py-4 gap-4 flex flex-row bg-white rounded shadow-xl items-center justify-between h-[66px] w-full">
          <div className="flex items-center gap-4">
            <span className="leading-none text-base font-semibold text-gray-500 ">
              {$resultSelectedAtom?.length} results selected
            </span>
            <span className="text-base font-normal text-gray-500">
              {' '}
              Do you want to download the selected files associated with this
              search?
            </span>
          </div>
          <div className="flex items-center gap-3">
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
            <div className="" onClick={() => setCloseBanner(true)}>
              <XIcon className="w-3 h-3 cursor-pointer" />
            </div>
          </div>
        </div>
      </div>
      <DownloadModal
        submitRef={downloadRef}
        onDownload={() => {
          props.onDownload?.();
        }}
        transcripts={
          $resultSelectedAtom?.map((item) => {
            return {
              text_id: item.transcript_slug,
              corpora_uuid: item.corpora_uuid,
              word_found: item.search_item.match_word,
              offset: item.search_item.offsetStart,
              offset_length: item.search_item.offsetLength,
              alignment_slug: item.alignment_slug,
            };
          }) ?? []
        }
      ></DownloadModal>
    </>
  );
};
