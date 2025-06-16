import { ArrowRight, Button, Checkbox, ChevronRight } from '@unic/core-ui';
import { ResultCorporaSearchRow } from '@unic/shared/corpora-dto';
import { useEffect, useState } from 'react';
import { atom } from 'nanostores';
import { useStore } from '@nanostores/react';
import { urlToDetalTranscript } from '../utils';
import { FixedSizeList as List } from 'react-window';

export interface DetailedResultsProps {
  items: ResultCorporaSearchRow[];
  acronym: string;
}

const gridClassName = 'grid grid-cols-[1fr_6fr_5fr_3fr_2fr] items-center';

export const resultSelectedAtom = atom<ResultCorporaSearchRow[] | null>(null);
export const resetAtom = atom(false);

export interface RowProps {
  data: { items: ResultCorporaSearchRow[]; acronym: string };
  index: number;
  style: React.CSSProperties;
}

const Row = ({ data, index, style }: RowProps) => (
  <div style={style}>
    <DetailedResultsRow
      item={data.items.length > index ? data.items[index] : data.items[0]}
      index={index}
      acronym={data.acronym}
      key={`${data.acronym}-${index}`}
    />
  </div>
);

export function DetailedResults(props: DetailedResultsProps) {
  const { items, acronym } = props;

  const [showAllResults, setShowAllResults] = useState<boolean>(false);

  const [checkAll, setCheckAll] = useState<boolean>(false);

  const resetAtomState = useStore(resetAtom);

  useEffect(() => {
    if (resetAtomState) {
      setCheckAll(false);
      resultSelectedAtom.set(null);
      resetAtom.set(false);
    }
  }, [resetAtomState]);

  const headerClassName =
    'p-4 text-left text-xs font-semibold text-gray-500 uppercase';

  return (
    <div>
      <div className="text-sm leading-normal text-gray-900 pb-5">
        {items.length} results for{' '}
        <span
          className="text-blue-800 underline"
          onClick={() => window.open(`/readme/${acronym}`, '_blank')}
        >
          {acronym.toUpperCase()}
        </span>
      </div>
      <div className="table w-full border border-gray-100 shadow-custom-shadow-table rounded-lg">
        <div
          className={`table-header bg-gray-50 rounded-t-lg ${gridClassName}`}
        >
          <span className={headerClassName}>
            <Checkbox
              name={`check-all-${acronym}`}
              key={`check-all-${acronym}`}
              onCheckedChange={() => {
                setCheckAll(!checkAll);
                if (checkAll === true) {
                  resultSelectedAtom.set(null);
                } else {
                  resultSelectedAtom.set(items);
                }
              }}
            />
          </span>
          <span className={headerClassName}>KWIC</span>
          <span className={headerClassName}>TRANSCRIPT ID</span>
          <span className={headerClassName}>TYPE</span>
          <span className={headerClassName}></span>
        </div>
        <div className="table-body overflow-hidden bg-white">
          <List
            className="List"
            height={showAllResults ? 500 : Math.min(80 * items.length, 350)}
            itemCount={
              !showAllResults ? Math.min(items.length, 5) : items.length
            }
            itemSize={70}
            width="100%"
            itemData={{ items, acronym }}
            style={{ overflowX: 'hidden' }}
          >
            {Row}
          </List>
        </div>
        <div className="table-footer w-full bg-white justify-start rounded-b-lg">
          {!showAllResults && items.length > 5 && (
            <div className="px-4 py-2.5">
              <Button
                icon={[{ icon: <ArrowRight />, position: 'right' }]}
                type="outlined-secondary"
                size="xs"
                onClick={() => {
                  setShowAllResults(true);
                }}
              >
                Show all
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export interface DetailedResultsRowProps {
  item: ResultCorporaSearchRow;
  acronym: string;
  index: number;
  isAllSelected?: boolean;
}

export function DetailedResultsRow(props: DetailedResultsRowProps) {
  const { item, acronym, index } = props;
  const $resultSelectedAtom = useStore(resultSelectedAtom);

  const detailUrl = urlToDetalTranscript(
    item.acronym,
    item.transcript_slug,
    item.search_item.match_word,
    item.search_item.offsetStart,
    item.search_item.offsetLength,
    item.alignment_slug,
  );

  const className = 'p-4 text-left text-gray-900 text-sm font-normal';

  return (
    <div className={gridClassName}>
      <div className={className}>
        <Checkbox
          name={`check-detail-${acronym}-${index}`}
          key={`check-detail-${acronym}-${index}`}
          checked={$resultSelectedAtom?.includes(item) ?? false}
          onCheckedChange={() => {
            if ($resultSelectedAtom?.includes(item)) {
              resultSelectedAtom.set(
                $resultSelectedAtom?.filter((i) => i !== item) ?? [],
              );
            } else {
              resultSelectedAtom.set([...($resultSelectedAtom || []), item]);
            }
          }}
        />
      </div>
      <div className={className}>
        <span>
          <p>
            {item.search_item.previus_chunk && (
              <span>{item.search_item.previus_chunk} </span>
            )}
            <span className="font-bold">{item.search_item.current_chunk}</span>
            {item.search_item.next_chunk && (
              <span> {item.search_item.next_chunk} </span>
            )}
          </p>
        </span>
      </div>
      <div className={className}>
        <span>{item.transcript_slug}</span>{' '}
      </div>
      <div className={className}>
        <span>{item.isSource ? 'source' : 'target'}</span>{' '}
      </div>
      <div className={className}>
        <Button
          icon={[{ icon: <ChevronRight />, position: 'center' }]}
          type="primary"
          size="xs"
          onClick={() => window.open(detailUrl, '_blank')}
        />
      </div>
    </div>
  );
}
