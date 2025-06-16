import useSwr from 'swr';
import { useHandleRespError } from '@unic/client-global-data-access';
import { useFetcher } from '@unic/client-authorization';

export function useGetValidAcronym(acronym: string) {
  const fetcher = useFetcher();
  const { handle, error } = useHandleRespError(false);

  const queryParams = new URLSearchParams();
  if (acronym) {
    queryParams.append('acronym', acronym);
  }

  const result = useSwr<{ isPresent: boolean }>(
    `/api/metadata-register/valid-acronym?${queryParams}`,
    fetcher,
  );

  const data = handle<{ isPresent: boolean }>(result.data);

  return {
    ...result,
    data,
    error,
  };
}
