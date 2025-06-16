import {
  AnnotationEnum,
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

export type elementSearchFilterDynamic = {
  corpora_name: listElementSearchFilterDynamic<string>[];
  source_language: listElementSearchFilterDynamic<LanguageId>[];
  target_language: listElementSearchFilterDynamic<LanguageId>[];
  // event table
  setting: listElementSearchFilterDynamic<SettingEnum>[];
  setting_specific: listElementSearchFilterDynamic<string>[];
  topic_domain: listElementSearchFilterDynamic<string>[];
  // transcript
  working_mode: listElementSearchFilterDynamic<WorkingModeEnum>[];
  // interpreter table
  interpreter_status: listElementSearchFilterDynamic<InterpreterStatusEnum>[];
  // event table
  event_year: listElementSearchFilterDynamic<string>[];
  // annotation table
  annotation_type: listElementSearchFilterDynamic<string>[];
  annotation_mode: listElementSearchFilterDynamic<AnnotationEnum>[];
  // corpora-metadata table
  creator: listElementSearchFilterDynamic<string>[];
  availability: listElementSearchFilterDynamic<CorporaMetadataAvailabilityEnum>[];
  publication_year: listElementSearchFilterDynamic<string>[];
  anonymization: listElementSearchFilterDynamic<CorporaMetadataAnonymizationEnum>[];
  transcription_status: listElementSearchFilterDynamic<CorporaMetadataTranscriptionStatusEnum>[];
  annotation_status: listElementSearchFilterDynamic<CorporaMetadataAnnotationStatusEnum>[];
  alignment_status: listElementSearchFilterDynamic<CorporaMetadataAlignmentStatusEnum>[];
  duration: listElementSearchFilterDynamic<string>[];

  data_modality: listElementSearchFilterDynamic<CorporaMetadataDataModalityEnum>[];
};

export type listElementSearchFilterDynamic<T> = {
  value: T;
  label: string;
};
