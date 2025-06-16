import { useHandleRespError } from '@unic/client-global-data-access';
import { useFetcher } from '@unic/client-authorization';
import { CorporaLicenseDto } from '@unic/shared/corpora-dto';
import { useEffect, useState } from 'react';
import useSwr from 'swr';

export function useLicenseCorpora(corpora_data: { corpora_uuid: string[] }) {
  const fetcher = useFetcher();
  const { handle, error } = useHandleRespError(false);

  function postFetcher(url: string) {
    return fetcher(url, {
      method: 'POST',
      body: corpora_data,
    });
  }

  const hashKey = useSha1(JSON.stringify(corpora_data));

  const result = useSwr<CorporaLicenseDto[]>(
    corpora_data?.corpora_uuid.length > 0
      ? `/api/corpora/license-url?cache_key=${hashKey}`
      : undefined,
    postFetcher,
  );

  const data = handle(result.data);

  return {
    ...result,
    data,
    error,
  };
}

export function useSha1(str: string) {
  const [currentHash, setCurrentHash] = useState<string | undefined>(undefined);

  useEffect(() => {
    const shaPromise = sha1(str)
      .then((out) => out)
      .catch((error) => {
        console.error(error);
        return String(Math.random() * 1000);
      });

    shaPromise.then((out) => setCurrentHash(out));
  }, [str]);

  return currentHash;
}

async function sha1(str: string) {
  const enc = new TextEncoder();
  const hash = await crypto.subtle.digest('SHA-1', enc.encode(str));
  return Array.from(new Uint8Array(hash))
    .map((v) => v.toString(16).padStart(2, '0'))
    .join('');
}
