import { RepositoryAssetDto } from '@unic/shared/global-types';
import useSwr from 'swr';
import { usePlainFetcher } from '@unic/client-authorization';
import { useHandleRespError } from '../hooks/use-hanlde-resp-error.hook';
import { useFetcher } from '@unic/client-authorization';

export function useRepositoryAsset(repository_assets_uuid?: string | null) {
  const fetcher = usePlainFetcher();
  const jsonFetcher = useFetcher();

  const { error, handle } = useHandleRespError(true);
  const { handle: notThrowHandle } = useHandleRespError(false);

  const result = useSwr<RepositoryAssetDto>(
    repository_assets_uuid
      ? `/api/repository_assets/info/${repository_assets_uuid}`
      : undefined,
    jsonFetcher,
  );

  const data = notThrowHandle(result.data);

  async function uploadFile(data: {
    file: File;
    scope: string;
    controller?: AbortController;
  }) {
    const formData = new FormData();
    formData.append('file', data.file);
    formData.append('scope', data.scope);

    const result = await fetcher(`/api/repository_assets/upload`, {
      method: 'POST',
      body: formData,
      signal: data.controller?.signal,
    });
    const body = await result.json();
    return handle<RepositoryAssetDto>(body);
  }

  return {
    error,
    uploadFile,
    repositoryAsset: data,
    isLoading: result.isLoading,
    isValidation: result.isValidating,
  };
}
