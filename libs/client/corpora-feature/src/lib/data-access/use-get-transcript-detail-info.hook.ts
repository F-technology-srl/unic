import useSwr from 'swr';
import { useHandleRespError } from '@unic/client-global-data-access';
import { useFetcher } from '@unic/client-authorization';
import { TranscriptData } from '@unic/shared/corpora-dto';

export function useGetTranscriptDetailInfo(
  corpora_slug: string,
  transcript_slug?: string | null,
) {
  const fetcher = useFetcher();
  const { handle, error } = useHandleRespError(false);

  const result = useSwr<TranscriptData>(
    transcript_slug
      ? `/api/corpora/${corpora_slug}/${transcript_slug}`
      : undefined,

    fetcher,
  );

  const data = handle<TranscriptData>(result.data);

  return {
    ...result,
    data,
    error,
  };
}
