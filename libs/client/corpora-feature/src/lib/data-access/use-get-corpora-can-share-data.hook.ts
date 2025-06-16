import useSwr from 'swr';
import { useHandleRespError } from '@unic/client-global-data-access';
import { useFetcher } from '@unic/client-authorization';
import { CorporaInfoCanUploadDto } from '@unic/shared/corpora-dto';

export function useGetCorporaConShareData() {
  const fetcher = useFetcher();
  const { handle, error } = useHandleRespError(false);

  const result = useSwr<CorporaInfoCanUploadDto[]>(
    `/api/corpora-upload-data/metadata-request-upload-data`,
    fetcher,
  );

  const data = handle<CorporaInfoCanUploadDto[]>(result.data);

  return {
    ...result,
    data,
    error,
  };
}
