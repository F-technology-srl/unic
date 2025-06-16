import { SettingEnum } from './corpora-metadata-setting.enum';
import { WorkingModeEnum } from './corpora-metadata-working-mode.enum';
import { AnnotationEnum } from './corpora-metatada-annotation.enum';
import { GenderEnum } from './gender.enum';
import { InterpreterStatusEnum } from './interpreter-status.enum';
import { LanguageId } from './languages.enum';
import { SexEnum } from './sex.enum';

export class CorporaEvent {
  event_id!: string;
  event_date?: string;
  setting?: SettingEnum;
  setting_specific?: string;
  topic_domain?: string[];
  event_duration?: string;
  event_token_gloss_count?: number;
}

export class SourceText {
  source_text_id!: string;
  source_language?: LanguageId[];
  source_language_variety_name?: string[];
  source_date?: string;
  interaction_format?: string;
  delivery_mode?: string;
  source_token_gloss_count?: number;
  source_duration?: string;
  source_delivery_rate?: string;
  transcript_file_name?: string;
  media_file_name?: string;
  annotation_file_name?: string;
  alignment_file_name?: string;
  event_id?: string;
  actor_id?: string;
  source_text_associated_file?: string;
}

export class TargetText {
  target_text_id!: string;
  target_language?: LanguageId[];
  target_date?: string;
  working_mode?: WorkingModeEnum;
  production_mode?: string;
  use_of_technology?: string;
  target_token_gloss_count?: number;
  target_delivery_rate?: string;
  transcript_file_name?: string;
  media_file_name?: string;
  annotation_file_name?: string;
  alignment_file_name?: string;
  source_text_id!: string;
  target_text_associated_file?: string;
  interpreter_id?: string;
}

export class Transcriber {
  transcriber_id!: string;
  transcriber_surname?: string;
  transcriber_given_name?: string;
}

export class Annotator {
  annotator_id!: string;

  annotator_surname?: string;

  annotator_given_name?: string;
}

export class AnnotationMetadata {
  annotation_type?: string[];
  annotation_mode?: AnnotationEnum;
  source_language?: LanguageId[];
  target_language?: LanguageId[];
  source_text_id!: string;
  target_text_id?: string;
}

export class AlignmentMetadata {
  alignment_type?: string;
  alignment_mode?: string;
  alignment_tool?: string;
  source_text_id?: string;
  target_text_id?: string;
}

export class Actor {
  actor_id!: string;
  actor_surname?: string;
  actor_given_name?: string;
  actor_gender?: GenderEnum;
  actor_sex?: string;
  actor_country?: string;
  actor_language_mother_tongue?: LanguageMotherTongue[];
}

export class LanguageMotherTongue {
  lang?: LanguageId;
  value?: boolean;
}

export class Interpreter {
  interpreter_id!: string;
  interpreter_surname?: string;
  interpreter_given_name?: string;
  interpreter_gender?: GenderEnum;
  interpreter_sex?: SexEnum;
  interpreter_status?: InterpreterStatusEnum;
  interpreter_language_mother_tongue?: InterpreterLanguageMotherTongue[];
}

class InterpreterLanguageMotherTongue {
  lang?: LanguageId;
  value?: boolean;
}

export class CorporaMetadataStructureJson {
  event?: CorporaEvent[];
  sourceText!: SourceText[];
  targetText?: TargetText[];
  transcriber?: Transcriber[];
  annotator?: Annotator[];
  annotation?: AnnotationMetadata[];
  alignment?: AlignmentMetadata[];
  actor?: Actor[];
  interpreter?: Interpreter[];
  duration?: string[];
}
