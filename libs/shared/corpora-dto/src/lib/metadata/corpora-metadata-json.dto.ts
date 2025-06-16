import {
  IsOptional,
  IsString,
  IsDateString,
  IsArray,
  IsNumber,
  IsBoolean,
  ValidateNested,
  IsEnum,
} from 'class-validator';
import { Type } from 'class-transformer';
import {
  LanguageId,
  CountryCode,
  SexEnum,
  GenderEnum,
  InterpreterStatusEnum,
  SettingEnum,
  WorkingModeEnum,
  AnnotationEnum,
} from '@unic/shared/database-dto';
// import { IsLowercaseWithoutSpacesOrSpecialChars } from '../decorators/valid-id.decorator';
//import { IsFileExtension } from '../decorators/valid-file-estension.decorator';

class Event {
  @IsString()
  //@IsLowercaseWithoutSpacesOrSpecialChars()
  event_id!: string;

  @IsOptional()
  @IsDateString()
  event_date?: string;

  @IsOptional()
  @IsEnum(SettingEnum)
  setting?: SettingEnum;

  @IsOptional()
  @IsString()
  setting_specific?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  topic_domain?: string[];

  @IsOptional()
  @IsString()
  event_duration?: string;

  @IsOptional()
  @IsNumber()
  event_token_gloss_count?: number;
}

class SourceText {
  @IsString()
  //@IsLowercaseWithoutSpacesOrSpecialChars()
  source_text_id!: string;

  @IsOptional()
  @IsArray()
  @IsEnum(LanguageId, { each: true })
  source_language?: LanguageId[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  source_language_variety_name?: string[];

  @IsOptional()
  @IsDateString()
  source_date?: string;

  @IsOptional()
  @IsString()
  interaction_format?: string;

  @IsOptional()
  @IsString()
  delivery_mode?: string;

  @IsOptional()
  @IsNumber()
  source_token_gloss_count?: number;

  @IsOptional()
  @IsString()
  source_duration?: string;

  @IsOptional()
  @IsString()
  source_delivery_rate?: string;

  @IsOptional()
  @IsString()
  // @IsFileExtension(['txt'])
  transcript_file_name?: string;

  @IsOptional()
  @IsString()
  // @IsFileExtension(['mp4', 'wav', 'mp3', 'ogg'])
  media_file_name?: string;

  @IsOptional()
  @IsString()
  // @IsFileExtension(['txt'])
  annotation_file_name?: string;

  @IsOptional()
  @IsString()
  // @IsFileExtension(['json'])
  alignment_file_name?: string;

  @IsOptional()
  @IsString()
  //@IsLowercaseWithoutSpacesOrSpecialChars()
  event_id?: string;

  @IsOptional()
  @IsString()
  //@IsLowercaseWithoutSpacesOrSpecialChars()
  actor_id?: string;

  @IsOptional()
  @IsString()
  target_text_associated_file?: string;
}

class TargetText {
  @IsString()
  //@IsLowercaseWithoutSpacesOrSpecialChars()
  target_text_id!: string;

  @IsOptional()
  @IsArray()
  @IsEnum(LanguageId, { each: true })
  target_language?: LanguageId[];

  @IsOptional()
  @IsDateString()
  target_date?: string;

  @IsOptional()
  @IsEnum(WorkingModeEnum)
  working_mode?: WorkingModeEnum;

  @IsOptional()
  @IsString()
  production_mode?: string;

  @IsOptional()
  @IsString()
  use_of_technology?: string;

  @IsOptional()
  @IsNumber()
  target_token_gloss_count?: number;

  @IsOptional()
  @IsString()
  target_delivery_rate?: string;

  @IsOptional()
  @IsString()
  // @IsFileExtension(['txt'])
  transcript_file_name?: string;

  @IsOptional()
  @IsString()
  // @IsFileExtension(['mp4', 'wav', 'mp3', 'ogg'])
  media_file_name?: string;

  @IsOptional()
  @IsString()
  // @IsFileExtension(['txt'])
  annotation_file_name?: string;

  @IsOptional()
  @IsString()
  // @IsFileExtension(['json'])
  alignment_file_name?: string;

  @IsString()
  //@IsLowercaseWithoutSpacesOrSpecialChars()
  source_text_id!: string;

  @IsOptional()
  @IsString()
  target_text_associated_file?: string;

  @IsOptional()
  @IsString()
  //@IsLowercaseWithoutSpacesOrSpecialChars()
  interpreter_id?: string;
}

class Transcriber {
  @IsString()
  //@IsLowercaseWithoutSpacesOrSpecialChars()
  transcriber_id!: string;

  @IsOptional()
  @IsString()
  transcriber_surname?: string;

  @IsOptional()
  @IsString()
  transcriber_given_name?: string;
}

class Annotator {
  @IsString()
  //@IsLowercaseWithoutSpacesOrSpecialChars()
  annotator_id!: string;

  @IsOptional()
  @IsString()
  annotator_surname?: string;

  @IsOptional()
  @IsString()
  annotator_given_name?: string;
}

class Annotation {
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  annotation_type?: string[];

  @IsOptional()
  @IsEnum(AnnotationEnum)
  annotation_mode?: AnnotationEnum;

  @IsOptional()
  @IsArray()
  @IsEnum(LanguageId, { each: true })
  source_language?: LanguageId[];

  @IsOptional()
  @IsArray()
  @IsEnum(LanguageId, { each: true })
  target_language?: LanguageId[];

  @IsString()
  //@IsLowercaseWithoutSpacesOrSpecialChars()
  source_text_id!: string;

  @IsOptional()
  @IsString()
  //@IsLowercaseWithoutSpacesOrSpecialChars()
  target_text_id?: string;
}

class Alignment {
  @IsOptional()
  @IsString()
  alignment_type?: string;

  @IsOptional()
  @IsString()
  alignment_mode?: string;

  @IsOptional()
  @IsString()
  alignment_tool?: string;

  @IsOptional()
  @IsString()
  //@IsLowercaseWithoutSpacesOrSpecialChars()
  source_text_id?: string;

  @IsOptional()
  @IsString()
  //@IsLowercaseWithoutSpacesOrSpecialChars()
  target_text_id?: string;
}

class Actor {
  @IsString()
  //@IsLowercaseWithoutSpacesOrSpecialChars()
  actor_id!: string;

  @IsOptional()
  @IsString()
  actor_surname?: string;

  @IsOptional()
  @IsString()
  actor_given_name?: string;

  @IsOptional()
  @IsEnum(GenderEnum)
  actor_gender?: GenderEnum;

  @IsOptional()
  @IsEnum(SexEnum)
  actor_sex?: string;

  @IsOptional()
  @IsEnum(CountryCode)
  actor_country?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ActorLanguageMotherTongue)
  actor_language_mother_tongue?: ActorLanguageMotherTongue[];
}

class ActorLanguageMotherTongue {
  @IsOptional()
  @IsString()
  lang?: LanguageId;

  @IsOptional()
  @IsBoolean()
  value?: boolean;
}

class Interpreter {
  @IsString()
  //@IsLowercaseWithoutSpacesOrSpecialChars()
  interpreter_id!: string;

  @IsOptional()
  @IsString()
  interpreter_surname?: string;

  @IsOptional()
  @IsString()
  interpreter_given_name?: string;

  @IsOptional()
  @IsEnum(GenderEnum)
  interpreter_gender?: GenderEnum;

  @IsOptional()
  @IsEnum(SexEnum)
  interpreter_sex?: SexEnum;

  @IsOptional()
  @IsEnum(InterpreterStatusEnum)
  interpreter_status?: InterpreterStatusEnum;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => InterpreterLanguageMotherTongue)
  interpreter_language_mother_tongue?: InterpreterLanguageMotherTongue[];
}

class InterpreterLanguageMotherTongue {
  @IsOptional()
  @IsString()
  lang?: LanguageId;

  @IsOptional()
  @IsBoolean()
  value?: boolean;
}

export class CorporaMetadataStructureJsonValidate {
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => Event)
  event?: Event[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SourceText)
  sourceText!: SourceText[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TargetText)
  targetText?: TargetText[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => Transcriber)
  transcriber?: Transcriber[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => Annotator)
  annotator?: Annotator[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => Annotation)
  annotation?: Annotation[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => Alignment)
  alignment?: Alignment[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => Actor)
  actor?: Actor[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => Interpreter)
  interpreter?: Interpreter[];
}
