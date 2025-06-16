import { useHandleRespError } from '@unic/client-global-data-access';
import {
  CorporaMetadataReturnDataDto,
  CreateCorporaMetadataDataDto,
} from '@unic/shared/corpora-dto';
import { useFetcher } from '@unic/client-authorization';

export function useCreateCorporaMetadata() {
  const fetcher = useFetcher();
  const { error, handle } = useHandleRespError(true);

  async function createCorporaMetadata(data: CreateCorporaMetadataDataDto) {
    const result = await fetcher(
      `/api/metadata-register/create-request-metadata`,
      {
        method: 'POST',
        body: data,
      },
    );

    return handle<CorporaMetadataReturnDataDto>(result);
  }

  return {
    error,
    createCorporaMetadata,
  };
}
