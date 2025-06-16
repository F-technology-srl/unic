import {
  UnicConventions,
  UnicRegex,
  UserConventionType,
} from '@unic/shared/corpora-dto';

export const ListOfUnicConvertions: UnicConventions = {
  end_of_sentence_token: {
    description: 'end of intonation|sentence',
    replaceCustomValueToUnic: (customToken?: string) => {
      const unicToken = '//';
      const unicTokenConversion = 'UnicEndOfSentenceToken';
      return regexChangeFixedValue(unicToken, unicTokenConversion, customToken);
    },
  },
  question_token: {
    description: 'question symbol',
    replaceCustomValueToUnic: (customToken?: string) => {
      const unicToken = '?';
      const unicTokenConversion = 'UnicQuestionToken';
      return regexChangeFixedValue(unicToken, unicTokenConversion, customToken);
    },
  },
  short_pause_token: {
    description: 'short pause 0.2 s and 0.5 s',
    replaceCustomValueToUnic: (customToken?: string) => {
      const unicToken = '(.)';
      const unicTokenConversion = 'UnicTokenShortPause';
      return regexChangeFixedValue(unicToken, unicTokenConversion, customToken);
    },
  },
  medium_pause_token: {
    description: 'medium pause 0.5 s and 1 s',
    replaceCustomValueToUnic: (customToken?: string) => {
      const unicToken = '(..)';
      const unicTokenConversion = 'UnicTokenMediumPause';
      return regexChangeFixedValue(unicToken, unicTokenConversion, customToken);
    },
  },
  long_pause_token_start: {
    description: 'start of pause longer than 1 s',
    replaceCustomValueToUnic: (customToken?: string) => {
      const unicToken = '(';
      const unicTokenConversion = 'UniTokenLongPauseStart';
      return regexChangeFixedValue(unicToken, unicTokenConversion, customToken);
    },
  },
  long_pause_token_end: {
    description: 'end of pause longer than 1 s',
    replaceCustomValueToUnic: (customToken?: string) => {
      const unicToken = ')';
      const unicTokenConversion = 'UniTokenLongPauseEnd';
      return regexChangeFixedValue(unicToken, unicTokenConversion, customToken);
    },
  },
  filled_pause_token: {
    description: 'filled pause',
    replaceCustomValueToUnic: (customToken?: string) => {
      const unicToken = '-eh-';
      const unicTokenConversion = 'UnicTokenFilledPause';
      return regexChangeFixedValue(unicToken, unicTokenConversion, customToken);
    },
  },
  ligature_and_latching_token: {
    description: 'Ligature and latching',
    replaceCustomValueToUnic: (customToken?: string) => {
      const unicToken = '(0)';
      const unicTokenConversion = 'UnicTokenLigatureAndLatching';
      return regexChangeFixedValue(unicToken, unicTokenConversion, customToken);
    },
  },
  syllable_lengthening_token: {
    description: 'Syllable lengthening',
    replaceCustomValueToUnic: (customToken?: string) => {
      const unicToken = ':';
      const unicTokenConversion = 'UnicTokenSyllableLengthening';
      return regexChangeFixedValue(unicToken, unicTokenConversion, customToken);
    },
  },
  false_start_token: {
    description: 'False start',
    replaceCustomValueToUnic: (customToken?: string) => {
      const unicToken = '=';
      const unicTokenConversion = 'UniTokenFalseStart';
      return regexChangeFixedValue(unicToken, unicTokenConversion, customToken);
    },
  },
  truncated_word_token: {
    description: 'Truncated word',
    replaceCustomValueToUnic: (customToken?: string) => {
      const unicToken = '= ';
      const unicTokenConversion = 'UnicTokenTruncatedWord';
      return regexChangeFixedValue(unicToken, unicTokenConversion, customToken);
    },
  },
  misspronunciation_word_token: {
    description: 'Misspronunciation word',
    replaceCustomValueToUnic: (customToken?: string) => {
      const unicToken = '∼';
      const unicTokenConversion = 'UniTokenMisspronunciationWord';
      return regexChangeFixedValue(unicToken, unicTokenConversion, customToken);
    },
  },
  misspronunciation_corret_form_start_token: {
    description: 'Misspronunciation correct form start ',
    replaceCustomValueToUnic: (customToken?: string) => {
      const unicToken = ' /';
      const unicTokenConversion = 'UniTokenMisspronunciationCorrectFormStart';
      return regexChangeFixedValue(unicToken, unicTokenConversion, customToken);
    },
  },
  misspronunciation_corret_form_end_token: {
    description: 'Misspronunciation correct form end',
    replaceCustomValueToUnic: (customToken?: string) => {
      const unicToken = '/ ';
      const unicTokenConversion = 'UniTokenMisspronunciationCorrectFormEnd';
      return regexChangeFixedValue(unicToken, unicTokenConversion, customToken);
    },
  },
  overlap_start_token: {
    description: 'Overlap start',
    replaceCustomValueToUnic: (customToken?: string) => {
      const unicToken = '[';
      const unicTokenConversion = 'UniTokenOverlapStart';
      return regexChangeFixedValue(unicToken, unicTokenConversion, customToken);
    },
  },
  overlap_end_token: {
    description: 'Overlap end',
    replaceCustomValueToUnic: (customToken?: string) => {
      const unicToken = ']';
      const unicTokenConversion = 'UniTokenOverlapEnd';
      return regexChangeFixedValue(unicToken, unicTokenConversion, customToken);
    },
  },
  vocal_noise_start_token: {
    description: 'Voce noise start',
    replaceCustomValueToUnic: (customToken?: string) => {
      const unicToken = '<';
      const unicTokenConversion = 'UnicVocalNoiseStart';
      return regexChangeFixedValue(unicToken, unicTokenConversion, customToken);
    },
  },
  vocal_noise_end_token: {
    description: 'Vocal noise end',
    replaceCustomValueToUnic: (customToken?: string) => {
      const unicToken = '>';
      const unicTokenConversion = 'UnicVocalNoiseEnd';
      return regexChangeFixedValue(unicToken, unicTokenConversion, customToken);
    },
  },
  /* Next two tokens are not present in graphic, should be deleted? */
  contest_start_token: {
    description: 'Contest start',
    replaceCustomValueToUnic: (customToken?: string) => {
      const unicToken = '((';
      const unicTokenConversion = 'UnicTokenContestStart';
      return regexChangeFixedValue(unicToken, unicTokenConversion, customToken);
    },
  },
  contest_end_token: {
    description: 'Contest end',
    replaceCustomValueToUnic: (customToken?: string) => {
      const unicToken = '))';
      const unicTokenConversion = 'UnicTokenContestEnd';
      return regexChangeFixedValue(unicToken, unicTokenConversion, customToken);
    },
  },
  /* --------------------------------------------------- */
  unintelligibility_start_token: {
    description: 'Unintelligibility start',
    replaceCustomValueToUnic: (customToken?: string) => {
      const unicToken = '((x';
      const unicTokenConversion = 'UnicTokenContestUnintelligibilityStart';
      return regexChangeFixedValue(unicToken, unicTokenConversion, customToken);
    },
  },
  unintelligibility_end_token: {
    description: 'Unintelligibility end',
    replaceCustomValueToUnic: (customToken?: string) => {
      const unicToken = '))';
      const unicTokenConversion = 'UnicTokenContestUnintelligibilityEnd';
      return regexChangeFixedValue(unicToken, unicTokenConversion, customToken);
    },
  },
  uncertainty_start_token: {
    description: 'Uncertainty start',
    replaceCustomValueToUnic: (customToken?: string) => {
      const unicToken = '((?';
      const unicTokenConversion = 'UnicTokenUncertaintyStartToken';
      return regexChangeFixedValue(unicToken, unicTokenConversion, customToken);
    },
  },
  uncertainty_end_token: {
    description: 'Uncertainty end',
    replaceCustomValueToUnic: (customToken?: string) => {
      const unicToken = '))';
      const unicTokenConversion = 'UnicTokenUncertaintyEndToken';
      return regexChangeFixedValue(unicToken, unicTokenConversion, customToken);
    },
  },
  speaker_talking_token: {
    description: 'Speaker talking start',
    replaceCustomValueToUnic: (customToken?: string) => {
      const unicToken = ':';
      const unicTokenConversion = 'UnicSpeakerTalkingToken';
      return regexChangeFixedValue(unicToken, unicTokenConversion, customToken);
    },
  },
};

function checkIfCustomTokenIsValid(customToken?: string): string | null {
  if (customToken && customToken?.length > 0) {
    return customToken.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // Escapa i caratteri speciali
  }
  return null;
}

function regexChangeFixedValue(
  unicToken: string,
  unicUniqueTokenConversion: string,
  customToken?: string,
): UnicRegex | void {
  const userToken = checkIfCustomTokenIsValid(customToken);
  if (userToken) {
    const regex = new RegExp(userToken, 'g');
    return {
      regex,
      unic_token: unicToken,
      unic_unique_token_conversion: unicUniqueTokenConversion,
    };
  }
}

/*
To avoid conflicts between Unic and custom tokens in different conversions, the user's characters are replaced with unique tokens.
After the second round, they are replaced with UNUC tokens
*/
export function convertToUnicConvention(
  fullText: string,
  userConventionRule: UserConventionType,
): string {
  const listOfRegex: UnicRegex[] = [];
  Object.entries(userConventionRule).forEach(([key, value]) => {
    const unicConvention = ListOfUnicConvertions[key as keyof UnicConventions];
    if (unicConvention && value) {
      const regexToApply = unicConvention.replaceCustomValueToUnic(value);
      if (regexToApply && regexToApply.regex) {
        listOfRegex.push(regexToApply);
      }
    }
  });
  let tempText = fullText;
  // Step 1: Replace all regex matches (client token) with unique tokens
  listOfRegex.forEach(({ regex, unic_unique_token_conversion }) => {
    tempText = tempText.replace(regex, unic_unique_token_conversion);
  });

  // Step 2: Replace unique tokens with final strings
  listOfRegex.forEach(({ unic_token, unic_unique_token_conversion }) => {
    const regex = new RegExp(
      checkIfCustomTokenIsValid(unic_unique_token_conversion) ?? '',
      'g',
    );
    tempText = tempText.replace(regex, unic_token);
  });

  return tempText;
}
