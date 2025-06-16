const MIN_NUMBER_OF_CHARACTERS = 2;

export function checkSearchCharactersIsValid(
  search?: string | null,
): string | null {
  if (!search) {
    return null;
  }

  const stringToCount = search.replace(/\*/g, '').replace(/ /g, '');

  const wordsOrSearch = stringToCount.split('|');

  const allValid = wordsOrSearch.every((element) => {
    // Funzione che ritorna true o false per ogni elemento
    return verifyIfValidSearchString(element);
  });

  return allValid ? search : null;
}

// Attention on not latin characters
export function verifyIfValidSearchString(search: string): boolean {
  if (search.length === 0) {
    return false;
  }

  // Verify if the search parameter is latin string
  const hasLatin = /[a-zA-Z]/.test(search);

  // if the string contains latin characters and is less than 3 characters, ignore
  if (hasLatin && search.length < MIN_NUMBER_OF_CHARACTERS) {
    return false;
  }

  // // you cant insert only special character
  // const specialsCharacters = /[-_()\\[\]{}.,;:'"?!+*/%&|^~=<@#\\$]/;
  // if (specialsCharacters.test(search) && search.length <= 1) {
  //   return false;
  // }

  return true;
}
