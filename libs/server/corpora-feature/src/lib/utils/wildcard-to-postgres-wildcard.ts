type WildCardSearchSupportedItem = {
  name: string;
  example: string;
  functionToConvert: (textToConvert: string) => string;
};

type ListOfWildCardSearchSupported = {
  astreisk: WildCardSearchSupportedItem;
  pipe: WildCardSearchSupportedItem;
  squareBracket: WildCardSearchSupportedItem;
  questionMark: WildCardSearchSupportedItem;
  roundBracket: WildCardSearchSupportedItem;
};

export function convertToPostgresWildcard(wordConversion: string) {
  if (
    wordConversion === '([1-9]' ||
    wordConversion === '([1-9])' ||
    wordConversion === '([0-9]' ||
    wordConversion === '([0-9])'
  ) {
    return '\\(\\d+(?:\\.\\d+)?\\)';
  }

  wordConversion =
    ListOfWildCardSearchSupported.astreisk.functionToConvert(wordConversion);

  wordConversion =
    ListOfWildCardSearchSupported.squareBracket.functionToConvert(
      wordConversion,
    );
  //question mark use [] to escape the character, call it before square bracket
  wordConversion =
    ListOfWildCardSearchSupported.questionMark.functionToConvert(
      wordConversion,
    );
  wordConversion =
    ListOfWildCardSearchSupported.roundBracket.functionToConvert(
      wordConversion,
    );

  return wordConversion;
}

export const ListOfWildCardSearchSupported: ListOfWildCardSearchSupported = {
  pipe: {
    name: 'pipe',
    example: 'cat | dog',
    functionToConvert: (textToConvert: string) => {
      //search | with space or without
      const arrayWordSearch = textToConvert?.split(/ \| |\|/) ?? [];
      const returnWords: string[] = [];
      arrayWordSearch.forEach((word) => {
        const wordConversion = convertToPostgresWildcard(word);
        returnWords.push(wordConversion);
      });

      return returnWords.join('|');
    },
  },
  astreisk: {
    name: 'asterisk',
    example: '*text* or *text or text*',
    functionToConvert: (textToConvert: string) => {
      const arrayWordSearch = textToConvert?.split(/\s+/) ?? [];
      const returnWords: string[] = [];
      arrayWordSearch.forEach((word) => {
        if (word.startsWith('*') && word.endsWith('*')) {
          const wordWithoutAsterisk = word.replace(/\*/g, '');
          returnWords.push(`\\w*${wordWithoutAsterisk}\\w*`);
        } else if (!word.startsWith('*') && word.endsWith('*')) {
          const wordWithoutAsterisk = word.replace(/\*/g, '');
          returnWords.push(`\\m${wordWithoutAsterisk}\\w*`);
        } else if (word.startsWith('*') && !word.endsWith('*')) {
          const wordWithoutAsterisk = word.replace(/\*/g, '');
          returnWords.push(`\\w*${wordWithoutAsterisk}\\s`);
        } else {
          returnWords.push(word);
        }
      });
      return returnWords.join(' ');
    },
  },
  squareBracket: {
    name: 'square bracket',
    example: '[ or ]',
    functionToConvert: (textToConvert: string) => {
      if (textToConvert === '[]') {
        // search all words inside [] -> [thank]
        return '\\[[^\\]]+\\]';
      }
      return textToConvert
        .replace(/\[/g, '\\[') // [
        .replace(/\]/g, '\\]'); // ]
    },
  },
  roundBracket: {
    name: 'round bracket',
    example: '( or ) -> (.) (..) (0) (( ((x ((? ((n/i)) ((n/s))',
    functionToConvert: (textToConvert: string) => {
      const arrayWordSearch = textToConvert?.split(/\s+/) ?? [];
      const returnWords: string[] = [];
      arrayWordSearch.forEach((word) => {
        if (word.startsWith('(.)')) {
          const wordConverted = word.replace('(.)', '\\(\\.\\)');
          returnWords.push(wordConverted);
        } else if (word.startsWith('(..)')) {
          const wordConverted = word.replace('(..)', '\\(\\.\\.\\)');
          returnWords.push(wordConverted);
        } else if (word.startsWith('((?')) {
          const wordConverted = word
            .replace('((?', '\\(\\(\\?')
            .replace('))', '\\)\\)');
          returnWords.push(wordConverted);
        } else {
          returnWords.push(word.replace(/\(/g, `\\(`).replace(/\)/g, `\\)`));
        }
      });
      return returnWords.join(' ');
    },
  },
  questionMark: {
    name: 'question mark',
    example: '?',
    functionToConvert: (textToConvert: string) => {
      // return textToConvert.replace(/\?/g, `[?]`);
      const arrayWordSearch = textToConvert?.split(/\s+/) ?? [];
      const returnWords: string[] = [];
      arrayWordSearch.forEach((word) => {
        if (word.endsWith('?') && !word.startsWith('(')) {
          // escape per il carattere ? per postgres
          const wordConverted = word.replace('?', '[?]');
          returnWords.push(wordConverted);
        } else {
          returnWords.push(word);
        }
      });
      return returnWords.join(' ');
    },
  },
};

export function convertSearchGlobalWildcardToPostgresWildcard(
  textToConvert: string,
): string {
  //first we separe the text by pipe
  //the pipe convert contains the asterisk check and conversion
  return ListOfWildCardSearchSupported.pipe.functionToConvert(textToConvert);
}
