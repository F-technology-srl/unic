import {
  CorporaMetadataAlignmentStatusEnum,
  CorporaMetadataAnnotationStatusEnum,
  CorporaMetadataAnonymizationEnum,
  CorporaMetadataAvailabilityEnum,
  CorporaMetadataStructureJson,
  CorporaMetadataTranscriptionStatusEnum,
  LanguageId,
} from '@unic/shared/database-dto';
import {
  IsArray,
  IsDateString,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateCorporaMetadataDataDto {
  @IsOptional()
  @IsString()
  corpora_uuid?: string;

  @IsString()
  name!: string;

  @IsString()
  acronym!: string;

  @IsOptional()
  @IsString()
  version?: string | null;

  @IsOptional()
  @IsString()
  persistent_identifier?: string | null;

  @IsString()
  citation!: string;

  @IsOptional()
  @IsString()
  article_reference?: string | null;

  @IsString()
  @MinLength(200)
  @MaxLength(2000)
  description!: string;

  @IsArray()
  @IsString({ each: true })
  creator!: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  contact_information?: string[] | null;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  contributors?: string[] | null;

  @IsOptional()
  @IsString()
  funding_information?: string | null;

  @IsEnum(CorporaMetadataAvailabilityEnum)
  availability!: CorporaMetadataAvailabilityEnum;

  @IsOptional()
  @IsString()
  license?: string | null;

  @IsOptional()
  @IsString()
  license_url?: string | null;

  @IsDateString()
  publication_date!: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  names_and_links?: string[] | null;

  @IsEnum(LanguageId, {
    each: true,
    message: 'Source language should be selected',
  })
  @IsArray({
    message: 'Source language should be selected',
  })
  source_language!: LanguageId[];

  @IsEnum(LanguageId, {
    each: true,
    message: 'Target language should be selected',
  })
  @IsArray({
    message: 'Target language should be selected',
  })
  target_language!: LanguageId[];

  @IsOptional()
  @IsString()
  size_disk_memory?: string | null;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  size_tokens?: number | null;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  number_of_files?: number | null;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  media_type?: string[] | null;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  number_of_interpreters?: number | null;

  @IsOptional()
  @IsString()
  duration?: string | null;

  @IsEnum(CorporaMetadataAnonymizationEnum)
  anonymization!: CorporaMetadataAnonymizationEnum;

  @IsOptional()
  @IsString()
  anonymization_description?: string | null;

  @IsEnum(CorporaMetadataTranscriptionStatusEnum)
  transcription_status!: CorporaMetadataTranscriptionStatusEnum;

  @IsOptional()
  @IsString()
  transcription_description?: string | null;

  @IsEnum(CorporaMetadataAnnotationStatusEnum)
  annotation_status!: CorporaMetadataAnnotationStatusEnum;

  @IsOptional()
  @IsString()
  annotation_status_description?: string | null;

  @IsEnum(CorporaMetadataAlignmentStatusEnum)
  alignment_status!: CorporaMetadataAlignmentStatusEnum;

  @IsOptional()
  @IsString()
  aligment_status_description?: string | null;

  @IsOptional()
  @Type(() => CorporaMetadataStructureJson)
  metadata_structure_json?: CorporaMetadataStructureJson | null;

  @IsString()
  @IsOptional()
  metadata_structure_json_text?: CorporaMetadataStructureJson | null;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  distribution?: string[] | null;

  @IsArray()
  @IsString({ each: true })
  setting!: string[];

  @IsArray()
  @IsString({ each: true })
  topic_domain!: string[];

  @IsArray()
  @IsString({ each: true })
  working_mode!: string[];
}
