import {
  CorporaMetadataAlignmentStatusEnum,
  CorporaMetadataAnnotationStatusEnum,
  CorporaMetadataAnonymizationEnum,
  CorporaMetadataAvailabilityEnum,
  CorporaMetadataDataModalityEnum,
  CorporaMetadataTranscriptionStatusEnum,
  InterpreterStatusEnum,
  LanguageId,
  SettingEnum,
  WorkingModeEnum,
} from '@unic/shared/database-dto';

import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsOptional,
  IsString,
} from 'class-validator';

export class CorporaFilterSearchDto {
  @IsOptional()
  @IsBoolean()
  data_available?: boolean;

  @IsOptional()
  @IsString({ each: true })
  @IsArray()
  corpus_name?: string[] | [];

  @IsOptional()
  @IsEnum(LanguageId, { each: true })
  @IsArray()
  source_language?: LanguageId[];

  @IsOptional()
  @IsEnum(LanguageId, { each: true })
  @IsArray()
  target_language?: LanguageId[];

  // if data_available is true

  @IsOptional()
  @IsString()
  event_year?: string;

  @IsOptional()
  @IsEnum(SettingEnum, { each: true })
  setting?: SettingEnum[];

  @IsOptional()
  @IsString()
  setting_specific?: string;

  @IsOptional()
  @IsString({ each: true })
  @IsArray()
  topic_domain?: string[] | [];

  @IsOptional()
  @IsEnum(WorkingModeEnum, { each: true })
  working_mode?: WorkingModeEnum[];

  @IsOptional()
  @IsEnum(InterpreterStatusEnum, { each: true })
  interpreter_status?: InterpreterStatusEnum;

  @IsOptional()
  @IsString({ each: true })
  @IsArray()
  annotation_type?: string[] | [];

  @IsOptional()
  @IsString()
  annotation_mode?: string;

  @IsString()
  @IsOptional()
  max_duration?: string;

  // if data_available is false

  @IsOptional()
  @IsString({ each: true })
  @IsArray()
  creator?: string[] | [];

  @IsOptional()
  @IsEnum(CorporaMetadataAvailabilityEnum)
  availability?: CorporaMetadataAvailabilityEnum | null;

  @IsOptional()
  @IsString({ each: true })
  @IsArray()
  publication_year?: string[] | [];

  @IsOptional()
  @IsEnum(CorporaMetadataAnonymizationEnum)
  anonymization?: CorporaMetadataAnonymizationEnum | null;

  @IsOptional()
  @IsEnum(CorporaMetadataTranscriptionStatusEnum)
  transcription_status?: CorporaMetadataTranscriptionStatusEnum | null;

  @IsOptional()
  @IsEnum(CorporaMetadataAnnotationStatusEnum)
  annotation_status?: CorporaMetadataAnnotationStatusEnum | null;

  @IsOptional()
  @IsEnum(CorporaMetadataAlignmentStatusEnum)
  alignment_status?: CorporaMetadataAlignmentStatusEnum | null;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsEnum(CorporaMetadataDataModalityEnum, { each: true })
  data_modality?: CorporaMetadataDataModalityEnum[];

  @IsOptional()
  @IsString()
  source_language_mother_tongue?: string | null;
}
