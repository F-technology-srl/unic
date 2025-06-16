import { checkSearchCharactersIsValid } from './limit-search-characters';

describe('Limit search characters', () => {
  it('Limit search characters null value', () => {
    expect(checkSearchCharactersIsValid()).toBeNull();
  });

  it('Limit search characters short value', () => {
    expect(checkSearchCharactersIsValid('a')).toBeNull();
  });

  it('Limit search characters invalid space  value', () => {
    expect(checkSearchCharactersIsValid(' a ')).toBeNull();
  });

  it('Limit search characters valid string value', () => {
    expect(checkSearchCharactersIsValid('abc')).toBe('abc');
  });

  it('Limit search characters invalid wildcard value', () => {
    expect(checkSearchCharactersIsValid('*ab*')).toBe('*ab*');
  });

  it('Limit search characters valid wildcard value', () => {
    expect(checkSearchCharactersIsValid('*abcd*')).toBe('*abcd*');
  });

  it('Limit search characters valid wildcard value', () => {
    expect(checkSearchCharactersIsValid('abc|avb')).toBe('abc|avb');
  });

  it('Limit search characters valid non latin  value', () => {
    expect(checkSearchCharactersIsValid('字')).toBe('字');
  });

  it('Limit search characters invalid space  value', () => {
    expect(checkSearchCharactersIsValid(' a b ')).toBe(' a b ');
  });

  // it('Limit search characters invalid special character  value', () => {
  //   expect(checkSearchCharactersIsValid('(')).toBeNull();
  // });
});
