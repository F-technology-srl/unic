import { useHandleRespError } from '@unic/client-global-data-access';
import {
  CorporaFilterSearchDto,
  CorporaMetadataSearchResultRowDto,
  ResultCorporaSearchRow,
} from '@unic/shared/corpora-dto';
import { useFetcher } from '@unic/client-authorization';

export function useGetSearchCorpora() {
  const fetcher = useFetcher();
  const { error, handle } = useHandleRespError(true);

  async function getSearchCorpora(
    data: CorporaFilterSearchDto,
    search?: string,
  ) {
    const result = await fetcher(`/api/corpora-search/search-corpora`, {
      method: 'POST',
      body: { ...data, search },
    });

    return handle<
      ResultCorporaSearchRow[] | CorporaMetadataSearchResultRowDto[]
    >(result);
  }

  return {
    error,
    getSearchCorpora,
  };
}
