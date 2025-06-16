import { LanguageId } from '@unic/shared/database-dto';
import { RepositoryAssetDto } from '@unic/shared/global-types';

export type TranscriptData = {
  corpora_uuid: string;
  transcript_uuid: string;
  full_text?: string | null;
  annotation_data?: string | null;
  media_repository_asset_uuid?: string | null;
  associeted_file_repository_asset_uuid?: string | null;
  alignments_data?: AlignmentsData[] | null;
  source_uuid?: string | null;

  sourceTranscript?: TranscriptData | null;
  targetsTranscript?: TranscriptData[] | null;
  alignmnets?: AlignmentsData[] | null;
  corpora?: CorporaData | null;

  event_uuid?: string | null;
  text_id: string | null;
  language?: LanguageId[] | null;
  language_variety_name?: string[] | null;
  date_text?: string | null;
  interaction_format?: string | null;
  delivery_mode?: string | null;
  token_gloss_count?: number | null;
  duration?: string | null;
  delivery_rate?: string | null;
  working_mode?: string | null;
  production_mode?: string | null;
  use_of_technology?: string | null;
  media_file?: RepositoryAssetDto | null;
  slug?: string | null;
};

export type AlignmentsData = {
  alignment_uuid: string;
  transcript_uuid: string;
  corpora_uuid: string;
  full_text: string | null;
  start: string | null;
  duration: string | null;
  sorting: number | null;
  id: string | null;
  source_id: string | null;
  slug: string | null;
};

export type CorporaData = {
  corpora_uuid: string;
  acronym: string;
};
