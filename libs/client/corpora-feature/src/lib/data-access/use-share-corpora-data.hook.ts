import { useHandleRespError } from '@unic/client-global-data-access';
import { useFetcher } from '@unic/client-authorization';
import { CorporaShareDataDto } from '@unic/shared/corpora-dto';

export function useShareCorporaData() {
  const fetcher = useFetcher();
  const { error, handle } = useHandleRespError(true);

  async function shareCorporaData(data: CorporaShareDataDto) {
    const result = await fetcher(`/api/corpora-upload-data/share-your-data`, {
      method: 'POST',
      body: data,
    });

    return handle<void>(result);
  }

  return {
    error,
    shareCorporaData,
  };
}
