import useSwr from 'swr';
import { useHandleRespError } from '@unic/client-global-data-access';
import { useFetcher } from '@unic/client-authorization';

export function useGetCorporaMetadataAlreadyPresent(acronym: string) {
  const fetcher = useFetcher();
  const { handle, error } = useHandleRespError(false);

  const queryParams = new URLSearchParams();
  if (acronym) {
    queryParams.append('acronym', acronym);
  }

  const result = useSwr<{ found: boolean }>(
    `/api/metadata-register/corpora-metadata-acronym?${queryParams}`,
    fetcher,
  );

  const data = handle<{ found: boolean }>(result.data);

  return {
    ...result,
    data,
    error,
  };
}
