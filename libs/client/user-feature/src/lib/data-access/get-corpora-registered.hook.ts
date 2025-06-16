import useSwr from 'swr';
import { useHandleRespError } from '@unic/client-global-data-access';
import { CorporaRegisteredDto } from '@unic/shared/corpora-dto';
import { useFetcher } from '@unic/client-authorization';

export function useGetCorporaRegistered() {
  const fetcher = useFetcher();
  const { handle, error } = useHandleRespError(false);

  const result = useSwr<CorporaRegisteredDto[]>(
    `/api/corpora/all-corpora-registered`,
    fetcher,
  );

  const data = handle<CorporaRegisteredDto[]>(result.data);

  return {
    ...result,
    data,
    error,
  };
}
