import { useFetcher } from '@unic/client-authorization';
import { useHandleRespError } from '@unic/client-global-data-access';
import { UpdateMetadataStatusDto } from '@unic/shared/corpora-dto';

export function useApproveCorporaMetadata() {
  const fetcher = useFetcher();
  const { error, handle } = useHandleRespError(true);

  async function approveCorporaMetadata(data: UpdateMetadataStatusDto) {
    const result = await fetcher(
      `/api/metadata-register/update-metadata-status/${data.token}`,
      {
        method: 'PUT',
        body: data,
      },
    );

    return handle<{ success: boolean }>(result);
  }

  return {
    error,
    approveCorporaMetadata,
  };
}
