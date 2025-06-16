import { useGetCorporaDownloads } from '@unic/client-user-feature';
import {
  ChevronRight,
  Button,
  Loader,
  Table,
  TableBody,
  TableHeader,
  TableRow,
  ArrowDownIcon,
  ModalHandle,
} from '@unic/core-ui';
import { urlToDetalTranscript } from '../utils';
import { DownloadModal } from './download-modal';
import { useRef, useState } from 'react';
import { TranscriptToDownload } from '@unic/shared/corpora-dto';

export const DownloadedCorporaTable = () => {
  const { data, isLoading } = useGetCorporaDownloads();

  const downloadRef = useRef<ModalHandle>(null);
  const [itemToRedownload, setItemToRedownload] = useState<
    TranscriptToDownload[]
  >([]);

  if (isLoading) {
    return <Loader></Loader>;
  }

  return data && data.length > 0 ? (
    <>
      <p className="text-base font-normal pb-5">
        You downloaded the following corpora since your registration.
      </p>
      <Table>
        <TableHeader>
          <span>CORPUS</span>
          <span>KWIC</span>
          <span>TRANSCRIPT ID</span>
          <span>DATE OF DOWLOAD</span>
          <span></span>
        </TableHeader>
        <TableBody>
          {data.map((item, index) => {
            const detailUrl =
              (item?.download_items?.length ?? 0) > 1 ||
              (item?.download_items?.length ?? 0) === 0
                ? null
                : urlToDetalTranscript(
                    item?.download_items?.[0].corpora?.acronym ?? '',
                    item.download_items?.[0].transcript?.slug ?? '',
                    item?.download_items?.[0].word_found ?? '',
                    item?.download_items?.[0].offset ?? '',
                    item?.download_items?.[0].offset_length ?? '',
                    item?.download_items?.[0].alignment_slug ?? '',
                  );
            const uniqueDownloadItems = item.download_items?.filter(
              (downloadItem, index, self) =>
                index ===
                self.findIndex(
                  (i) => i.corpora_uuid === downloadItem.corpora_uuid,
                ),
            );

            return (
              <TableRow key={`row-${item.download_uuid}-${index}`}>
                <span className="uppercase text-sm font-medium text-blue-800 hover:underline">
                  {uniqueDownloadItems?.map((downlaodItem, index) => {
                    return (
                      <a
                        key={`${downlaodItem.corpora_uuid}-${downlaodItem.text_id}-${index}`}
                        href={`readme/${downlaodItem.corpora?.acronym ?? ''}`}
                      >
                        {downlaodItem.corpora?.acronym ?? ''}{' '}
                        {index < (uniqueDownloadItems?.length ?? 0) - 1 && ', '}
                      </a>
                    );
                  })}
                </span>
                <span className="text-sm font-medium text-grey-700">
                  {item.download_items?.[0].word_found ?? ''}
                </span>
                <span className="line-clamp-3">
                  {item.download_items?.map((item) => item.text_id).join(', ')}
                </span>
                <span className="whitespace-nowrap">
                  {new Date(item.created_at)?.toISOString()?.split('T')?.[0] ??
                    ''}
                </span>
                <span className="flex md:flex-row flex-col gap-[6px] justify-end">
                  <Button
                    type="primary"
                    size="round-no-border"
                    icon={[{ icon: <ChevronRight />, position: 'right' }]}
                    disabled={!detailUrl}
                    onClick={() => (window.location.href = detailUrl ?? '')}
                  ></Button>
                  <Button
                    type="secondary"
                    size="round"
                    icon={[{ icon: <ArrowDownIcon />, position: 'right' }]}
                    onClick={() => {
                      setItemToRedownload(item.download_items ?? []);
                      downloadRef.current?.toggleState();
                    }}
                  ></Button>
                </span>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
      <DownloadModal
        submitRef={downloadRef}
        transcripts={itemToRedownload}
      ></DownloadModal>
      <p className="mt-7 text-base font-normal text-gray-700">
        Have you published new findings based on the downloaded corpora? Let the
        authors know by clicking on the author contact information on the
        landing page of the corpus.
      </p>
    </>
  ) : (
    <div className="text-base font-normal mb-5">There are no downloads.</div>
  );
};
