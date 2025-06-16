import { useGetSearchCorpora } from '../data-access/get-search-corpora.hook';
import { useState, useEffect } from 'react';
import { Accordion, Loader } from '@unic/core-ui';
import {
  CorporaFilterSearchDto,
  CorporaMetadataSearchResultRowDto,
  ResultCorporaSearchRow,
} from '@unic/shared/corpora-dto';
import {
  DetailedResults,
  resultSelectedAtom,
  resetAtom,
} from '../components/detailed-results';
import {
  BannerSelectDownloadTranscript,
  HelpModal,
  SearchSidebarForm,
  SearchTextForm,
} from '../components';

type ResultsType =
  | ResultCorporaSearchRow[]
  | CorporaMetadataSearchResultRowDto[];

export const SearchCorporaPage = () => {
  const [textSearchSubmit, setTextSearchSubmit] = useState(false);
  const [availableOnUnic, setAvailableOnUnic] = useState(true);
  const [metadataFilter, setMetadataFilter] = useState<
    CorporaFilterSearchDto | null | undefined
  >();

  const { getSearchCorpora } = useGetSearchCorpora();

  const [resultsSearch, setResultsSearch] = useState<ResultsType | null>();
  const [resultLoading, setResultLoading] = useState(false);
  const [firstLoad, setFirstLoad] = useState(true);

  const maxLengthTitle = 100;
  const maxCreatorLength = 50;
  const maxLengthContent = 100;
  const dataAvailableDefaultValue = true;

  const groupByAcronym = (
    data: ResultCorporaSearchRow[],
  ): { [key: string]: ResultCorporaSearchRow[] } => {
    return data.reduce(
      (acc, item) => {
        if (!acc[item.acronym]) {
          acc[item.acronym] = [];
        }
        acc[item.acronym].push(item);
        return acc;
      },
      {} as { [key: string]: ResultCorporaSearchRow[] },
    );
  };

  function searchCorpora(search?: string, filters?: CorporaFilterSearchDto) {
    setResultLoading(true);
    setFirstLoad(false);
    const filtersToSearch = filters ?? metadataFilter ?? {};
    // //set defulat value
    // if (
    //   filtersToSearch?.data_available === undefined ||
    //   filtersToSearch?.data_available === null
    // ) {
    //   filtersToSearch.data_available = true;
    // }

    const searchValue = filtersToSearch.data_available ? search : undefined;

    if (searchValue && searchValue.length > 0) {
      setTextSearchSubmit(true);
    } else {
      setTextSearchSubmit(false);
    }

    setAvailableOnUnic(
      filtersToSearch?.data_available ?? dataAvailableDefaultValue,
    );

    if (!availableOnUnic) {
      setResultsSearch(null);
      setFirstLoad(true);
    }

    console.log({ step: 1, message: 'adesso chiamo getSearchCorpora()' });
    console.log({ filtersToSearch });
    console.log({ searchValue });

    getSearchCorpora(filtersToSearch, searchValue)
      .then((data) => {
        console.log({
          step: 2,
          message: 'getSearchCorpora() ha risposto',
          data,
        });
        setResultsSearch(data);
      })
      .finally(() => {
        setResultLoading(false);
      });
  }

  function getNumberOfCorpora() {
    if (textSearchSubmit && resultsSearch) {
      return Object.keys(
        groupByAcronym(resultsSearch as ResultCorporaSearchRow[]),
      ).length;
    } else {
      return resultsSearch?.length ?? 0;
    }
  }

  useEffect(() => {
    resultSelectedAtom.set(null);
    searchCorpora(undefined, {});
  }, []);

  return (
    <div className="flex sm:flex-row flex-col mx-auto max-w-[1280px] bg-gray-50 w-full gap-10">
      <SearchSidebarForm
        onSubmit={(values) => {
          console.log('invio il form', values);
          // console.log(JSON.stringify(values))
          setMetadataFilter(values);
          searchCorpora(undefined, values);
        }}
        onChangeAvailableOnUnic={(value) => {
          // setMetadataFilter({ ...metadataFilter, data_available: value });
        }}
      />
      <div className="flex flex-col gap-7 w-full pb-0">
        {availableOnUnic && (
          <div className="flex flex-row gap-4 items-end justify-between">
            <div className="flex flex-row gap-4 items-end justify-start">
              <SearchTextForm
                onSubmit={(values) => {
                  const filters = {
                    ...metadataFilter,
                    ...values,
                    ...{
                      data_available: dataAvailableDefaultValue,
                    },
                  };
                  setMetadataFilter(filters);
                  searchCorpora(values.search, filters);
                }}
              />

              <HelpModal></HelpModal>
            </div>
            <div className="text-xs">
              {String(getNumberOfCorpora() ?? 0)} interpreting corpora
            </div>
          </div>
        )}
        {textSearchSubmit && (
          <span className="text-xl leading-none text-gray-900 font-semibold">
            Showing the top five results of each corpus
          </span>
        )}
        {!resultLoading && (
          <div className="relative">
            <div
              className="flex flex-col gap-7 w-full max-h-[780px] overflow-y-auto scrollbar-transparent pb-2"
              key="search-list"
            >
              {resultsSearch && resultsSearch.length > 0
                ? textSearchSubmit
                  ? resultsSearch &&
                    Object.values(
                      groupByAcronym(resultsSearch as ResultCorporaSearchRow[]),
                    ).map((result, index) => {
                      return (
                        <DetailedResults
                          key={'detailed-results-' + index}
                          items={(
                            resultsSearch as ResultCorporaSearchRow[]
                          ).filter(
                            (item) => item.acronym === result[0].acronym,
                          )}
                          acronym={result[0].acronym}
                        />
                      );
                    })
                  : !textSearchSubmit &&
                    (resultsSearch as CorporaMetadataSearchResultRowDto[])?.map(
                      (result, index) => {
                        const title =
                          result.acronym.toUpperCase() +
                          ' - ' +
                          result.search_item.name;
                        const creators =
                          result.search_item.creator
                            ?.map((creator) => creator)
                            .join(', ') || '';
                        const description =
                          result.search_item.description || '';
                        const content =
                          (
                            <div
                              className="flex flex-col gap-0"
                              key={`result-content-metadata-${index}`}
                            >
                              <span>
                                {creators.length > maxCreatorLength
                                  ? creators.slice(0, maxCreatorLength) + '...'
                                  : creators}
                              </span>
                              <span>
                                {description.length > maxLengthContent
                                  ? description.slice(0, maxLengthContent) +
                                    '...'
                                  : description}
                              </span>
                            </div>
                          ) || '';
                        return (
                          <Accordion
                            key={`result-content-metadata-${index}`}
                            title={
                              title.length > maxLengthTitle
                                ? title.slice(0, maxLengthTitle) + '...'
                                : title
                            }
                            content={content || ''}
                            onClick={() => {
                              window.open(
                                `/readme/${result.acronym}`,
                                '_blank',
                              );
                            }}
                          />
                        );
                      },
                    )
                : !firstLoad && <div>No results found</div>}
            </div>
            <BannerSelectDownloadTranscript
              onDownload={() => {
                resetAtom.set(true);
              }}
            ></BannerSelectDownloadTranscript>
          </div>
        )}
        {resultLoading && (
          <Loader
            notMiddlePage
            className="mx-auto mt-10"
            text={
              metadataFilter?.search
                ? 'The search may take a few minutes to complete'
                : ''
            }
          ></Loader>
        )}
      </div>
    </div>
  );
};

export default SearchCorporaPage;
