export type UnicConventions = {
  end_of_sentence_token: UnicConventionItem;
  question_token: UnicConventionItem;
  speaker_talking_token: UnicConventionItem;
  overlap_start_token: UnicConventionItem;
  overlap_end_token: UnicConventionItem;
  short_pause_token: UnicConventionItem;
  medium_pause_token: UnicConventionItem;
  long_pause_token_start: UnicConventionItem;
  long_pause_token_end: UnicConventionItem;
  ligature_and_latching_token: UnicConventionItem;
  filled_pause_token: UnicConventionItem;
  unintelligibility_start_token: UnicConventionItem;
  unintelligibility_end_token: UnicConventionItem;
  uncertainty_start_token: UnicConventionItem;
  uncertainty_end_token: UnicConventionItem;
  vocal_noise_start_token: UnicConventionItem;
  vocal_noise_end_token: UnicConventionItem;
  misspronunciation_word_token: UnicConventionItem;
  misspronunciation_corret_form_start_token: UnicConventionItem;
  misspronunciation_corret_form_end_token: UnicConventionItem;
  truncated_word_token: UnicConventionItem;
  false_start_token: UnicConventionItem;
  contest_start_token: UnicConventionItem;
  contest_end_token: UnicConventionItem;
  syllable_lengthening_token: UnicConventionItem;
};

export type UserConventionType = {
  [K in keyof UnicConventions]?: string | null;
};

export type UnicConventionItem = {
  description: string;
  replaceCustomValueToUnic: (customToken?: string) => UnicRegex | null | void;
};

export type UnicRegex = {
  regex: RegExp;
  unic_token: string;
  unic_unique_token_conversion: string;
};
