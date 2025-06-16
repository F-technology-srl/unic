import useSwr from 'swr';
import { useHandleRespError } from '@unic/client-global-data-access';
import { elementSearchFilterDynamic } from '@unic/shared/corpora-dto';
import { useFetcher } from '@unic/client-authorization';

export function useGetCorporaFilters(data_available?: boolean) {
  const fetcher = useFetcher();
  const { handle, error } = useHandleRespError(false);

  const queryParams = new URLSearchParams();
  queryParams.append('data_available', data_available ? 'true' : 'false');

  const result = useSwr<elementSearchFilterDynamic>(
    `/api/corpora-search/get-corpora-filters?${queryParams}`,
    fetcher,
  );
  const data = handle<elementSearchFilterDynamic>(result.data);

  return {
    ...result,
    data,
    error,
  };
}
