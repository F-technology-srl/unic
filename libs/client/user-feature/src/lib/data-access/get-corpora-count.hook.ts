import useSwr from 'swr';
import { useHandleRespError } from '@unic/client-global-data-access';
import { CorporaCountDto } from '@unic/shared/corpora-dto';
import { useFetcher } from '@unic/client-authorization';

export function useGetCorporaCount() {
  const fetcher = useFetcher();
  const { handle, error } = useHandleRespError(false);

  const result = useSwr<CorporaCountDto>(`/api/corpora/count`, fetcher);

  const data = handle<CorporaCountDto>(result.data);

  return {
    ...result,
    data,
    error,
  };
}
