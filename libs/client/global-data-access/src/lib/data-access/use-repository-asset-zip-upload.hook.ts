import { useHandleRespError } from '../hooks/use-hanlde-resp-error.hook';
import { RepositoryAssetDto, ZipCategory } from '@unic/shared/global-types';
import useSwr from 'swr';
import { usePlainFetcher } from '@unic/client-authorization';
import { useFetcher } from '@unic/client-authorization';

export function useRepositoryAssetZip(repository_assets_uuid?: string | null) {
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
    category: ZipCategory;
    onProgress: (progress: number) => void;
  }) {
    return new Promise<RepositoryAssetDto | null>((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      const formData = new FormData();

      formData.append('file', data.file);
      formData.append('scope', data.scope);
      formData.append('category', data.category);

      xhr.open('POST', `/api/repository_assets/upload-zip`, true);

      if (data.controller) {
        xhr.onabort = () => reject(new DOMException('Upload aborted.'));
        data.controller.signal.addEventListener('abort', () => xhr.abort());
      }

      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const percentComplete = (event.loaded / event.total) * 100;
          data.onProgress(percentComplete);
        }
      };

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve(JSON.parse(xhr.response) as RepositoryAssetDto);
        } else {
          reject(new Error('Request error, please try again.'));
        }
      };

      xhr.onerror = (e) => {
        console.error(e);
        reject(new Error('An error occurred while uploading the file.'));
      };

      xhr.ontimeout = function () {
        console.log('Request timed out');
        reject(new Error('Request timed out, please try again.'));
      };

      xhr.timeout = 3 * 60 * 60 * 1000; // upload-zip timeout - 3 hours
      xhr.send(formData);
    });
  }

  return {
    error,
    uploadFile,
    repositoryAsset: data,
    isLoading: result.isLoading,
    isValidation: result.isValidating,
  };
}
