import { useHandleRespError } from '@unic/client-global-data-access';
import { useFetcher } from '@unic/client-authorization';
import { DownloadBodyRequestDto } from '@unic/shared/corpora-dto';
import { RepositoryAssetDto } from '@unic/shared/global-types';

export function useDowloadCorporaData() {
  const fetcher = useFetcher();
  const { error, handle } = useHandleRespError(true);

  async function downloadCorporaData(data: DownloadBodyRequestDto) {
    const result = await fetcher(
      `/api/corpora-download-data/download-transcripts-zip`,
      {
        method: 'POST',
        body: data,
      },
    );

    return handle<RepositoryAssetDto>(result);
  }

  return {
    error,
    downloadCorporaData,
  };
}
