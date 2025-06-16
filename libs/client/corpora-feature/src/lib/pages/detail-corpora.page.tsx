import React, { useEffect } from 'react';
import { ResultSearchDetail } from '../components';
import { useIncreaseCorporaCounter } from '../data-access';

export interface DetailCorporaPageProps {
  corpora_slug?: string;
  transcript_slug?: string;
  alignment_slug?: string;
  offset?: string;
  offsetLength?: string;
  wordSearch?: string;
}

export const DetailCorporaPage = (props: DetailCorporaPageProps) => {
  const { increaseCorporaCounter } = useIncreaseCorporaCounter();

  useEffect(() => {
    increaseCorporaCounter({ corpora_slug: props.corpora_slug ?? '' });
  }, [increaseCorporaCounter, props.corpora_slug]);

  if (!props.corpora_slug) {
    return <div>Corpus not found</div>;
  }

  if (!props.transcript_slug) {
    return <div>Transcript not found</div>;
  }

  return (
    <div className="flex-1 pb-11">
      <ResultSearchDetail
        corpora_slug={props.corpora_slug}
        transcript_slug={props.transcript_slug}
        alignment_slug={props.alignment_slug}
        offset={props.offset ? Number(props.offset) : undefined}
        offsetLength={
          props.offsetLength ? Number(props.offsetLength) : undefined
        }
        wordSearch={props.wordSearch}
      />
    </div>
  );
};
