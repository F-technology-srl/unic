import {
  CorporaMetadataStatusEnum,
  CorporaMetadataAvailabilityEnum,
  CorporaMetadataTranscriptionStatusEnum,
  CorporaMetadataAlignmentStatusEnum,
  CorporaMetadataAnnotationStatusEnum,
  CorporaMetadataAnonymizationEnum,
  CorporaMetadataStructureJson,
  LanguageId,
} from '@unic/shared/database-dto';

export class CorporaMetadataSearchResultDto {
  corpora_metadata_uuid?: string | null;
  corpora_uuid?: string | null;
  name?: string | null;
  version?: string | null;
  persistent_identifier?: string | null;
  citation?: string | null;
  article_reference?: string | null;
  description?: string | null;
  creator?: string[] | null;
  contact_information?: string[] | null;
  contributors?: string[] | null;
  funding_information?: string | null;
  availability?: CorporaMetadataAvailabilityEnum | null;
  license?: string | null;
  license_url?: string | null;
  publication_date?: string | null;
  names_and_links?: string[] | null;
  source_language?: LanguageId[] | null;
  target_language?: LanguageId[] | null;
  size_disk_memory?: string | null;
  size_tokens?: number | null;
  number_of_files?: number | null;
  media_type?: string[] | null;
  number_of_interpreters?: number | null;
  duration?: string | null;
  anonymization?: CorporaMetadataAnonymizationEnum | null;
  anonymization_description?: string | null;
  transcription_status?: CorporaMetadataTranscriptionStatusEnum | null;
  transcription_description?: string | null;
  annotation_status?: CorporaMetadataAnnotationStatusEnum | null;
  annotation_status_description?: string | null;
  alignment_status?: CorporaMetadataAlignmentStatusEnum | null;
  aligment_status_description?: string | null;
  metadata_structure_json?: CorporaMetadataStructureJson | null;
  status?: CorporaMetadataStatusEnum | null;
  verified_at?: Date | null;

  distribution?: string[] | null;
  setting?: string[] | null;
  topic_domain?: string[] | null;
  working_mode?: string[] | null;
}

export type CorporaMetadataSearchResultRowDto = {
  isSource: boolean;
  search_item: CorporaMetadataSearchResultDto;
  acronym: string;
  transcript_slug: string;
  alignment_slug?: string;
};
