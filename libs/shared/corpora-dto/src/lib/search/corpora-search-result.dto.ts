export type ResultCorporaSearchRow = {
  isSource: boolean;
  search_item: ResultCorporaSearch;
  acronym: string;
  transcript_slug: string;
  alignment_slug?: string;
  corpora_name?: string; // added missing fields
  corpora_uuid: string;
  source?: { name: string; transcript_uuid: string };
  targets?: [
    { name: string; transcript_uuid: string; repository_asset_uuid: string },
  ];
};

export type ResultCorporaSearch = {
  transcript_uuid: string;
  alignment_uuid?: string;
  alignment_slug?: string;
  corpora_uuid: string;
  full_text?: string | null;
  match_word: string;
  offsetStart?: number;
  offsetLength?: number;
  name?: string;
  creator?: string[];
  description?: string;
  text_id: string;
  transcript_slug: string;
  source_uuid: string | null;
  previus_chunk?: string;
  next_chunk?: string;
  current_chunk?: string;
};

export type ResultSearchTranscript = {
  transcript_uuid: string;
  full_text?: string | null;
  match_word: string;
  corpora_uuid: string;
  text_id: string;
  transcript_slug: string;
  source_uuid: string | null;
};

export type ResultSearchAlignment = {
  alignment_uuid: string;
  full_text?: string | null;
  start?: string | null;
  duration?: string | null;
  sorting: number | null;
  transcript_uuid: string;
  match_word: string;
  corpora_uuid: string;
  alignment_slug: string;
  text_id: string;
  transcript_slug: string;
  source_uuid: string | null;
};
