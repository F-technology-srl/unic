import {
  CorporaMetadataAlignmentStatusEnum,
  CorporaMetadataAnnotationStatusEnum,
  CorporaMetadataAnonymizationEnum,
  CorporaMetadataAvailabilityEnum,
  CorporaMetadataTranscriptionStatusEnum,
  LanguageId,
} from '@unic/shared/database-dto';
import { CorporaMetadataStructureJsonValidate } from './corpora-metadata-json.dto';

export class CorporaMetadataReturnDataDto {
  corpora_uuid!: string | null;
  name!: string;
  acronym!: string;
  version?: string | null;
  persistent_identifier?: string | null;
  citation!: string;
  article_reference?: string | null;
  description!: string;
  creator!: string[];
  contact_information?: string[] | null;
  contributors?: string[] | null;
  funding_information?: string | null;
  availability!: CorporaMetadataAvailabilityEnum;
  license?: string | null;
  license_url?: string | null;
  publication_date!: string;
  names_and_links?: string[] | null;
  source_language!: LanguageId[];
  target_language!: LanguageId[];
  size_disk_memory?: string | null;
  size_tokens?: number | null;
  number_of_files?: number | null;
  media_type?: string[] | null;
  number_of_interpreters?: number | null;
  duration?: string | null;
  anonymization!: CorporaMetadataAnonymizationEnum;
  anonymization_description?: string | null;
  transcription_status!: CorporaMetadataTranscriptionStatusEnum;
  transcription_description?: string | null;
  annotation_status!: CorporaMetadataAnnotationStatusEnum;
  annotation_status_description?: string | null;
  alignment_status!: CorporaMetadataAlignmentStatusEnum;
  aligment_status_description?: string | null;
  metadata_structure_json?: CorporaMetadataStructureJsonValidate | null;

  distribution?: string[] | null;
  setting!: string[];
  topic_domain!: string[];
  working_mode!: string[];
}
