import { useHandleRespError } from '@unic/client-global-data-access';
import { useFetcher } from '@unic/client-authorization';

export function useIncreaseCorporaCounter() {
  const fetcher = useFetcher();
  const { error, handle } = useHandleRespError(true);

  async function increaseCorporaCounter(data: { corpora_slug: string }) {
    const result = await fetcher(`/api/corpora/visit/${data.corpora_slug}`, {
      method: 'POST',
      body: data,
    });

    return handle<void>(result);
  }

  return {
    error,
    increaseCorporaCounter,
  };
}
