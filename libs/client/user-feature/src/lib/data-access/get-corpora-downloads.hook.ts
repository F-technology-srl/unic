import useSwr from 'swr';
import { useHandleRespError } from '@unic/client-global-data-access';
import { DownloadsDoneResponse } from '@unic/shared/corpora-dto';
import { useFetcher } from '@unic/client-authorization';

export function useGetCorporaDownloads() {
  const fetcher = useFetcher();
  const { handle, error } = useHandleRespError(false);

  const result = useSwr<DownloadsDoneResponse[]>(
    `/api/corpora/all-corpora-dowloads`,
    fetcher,
  );

  const data = handle<DownloadsDoneResponse[]>(result.data);

  return {
    ...result,
    data,
    error,
  };
}
