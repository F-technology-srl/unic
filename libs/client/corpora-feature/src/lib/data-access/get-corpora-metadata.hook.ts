import useSwr from 'swr';
import { CorporaMetadataReturnDataDto } from '@unic/shared/corpora-dto';
import { useHandleRespError } from '@unic/client-global-data-access';
import { useFetcher } from '@unic/client-authorization';

export function useGetCorporaMetadata(
  acronym: string,
  status?: string,
  isUpdate?: boolean,
) {
  const fetcher = useFetcher();
  const { handle, error } = useHandleRespError(false);

  const queryParams = new URLSearchParams();
  if (acronym) {
    queryParams.append('acronym', acronym);
  }

  if (status) {
    queryParams.append('status', status);
  }

  if (isUpdate) {
    queryParams.append('isUpdate', String(isUpdate));
  }

  const result = useSwr<CorporaMetadataReturnDataDto>(
    `/api/metadata-register/metadata-request-data?${queryParams}`,
    fetcher,
  );

  const data = handle<CorporaMetadataReturnDataDto>(result.data);

  return {
    ...result,
    data,
    error,
  };
}
