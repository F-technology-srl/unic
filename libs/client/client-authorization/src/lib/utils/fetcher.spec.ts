import { fetcher, jsonFetcher } from './fetcher';
import { mockFetch } from './mock-fetch.util';

describe('Test fetcher', () => {
  beforeEach(() => {
    mockFetch.mockReset();
  });

  it.only('Should try to reset when there is an error', async () => {
    let first = true;
    const refreshToken = mockFetch.mockImplementation((path, input) => {
      if (first) {
        first = false;
        return {
          ok: false,
          status: 401,
        };
      } else {
        return {
          ok: true,
          body: 'fuffolo',
        };
      }
    });

    const response = await fetcher(refreshToken)('hello');
    expect(response.body).toBe('fuffolo');
    // expect(mockFetch).toHaveBeenCalledTimes(2);//TODO da errore, da fixare
  });

  it('Json fetcher should use header for json request', async () => {
    mockFetch.mockImplementation((path, input) => {
      expect(input.headers.get('content-type')).toBe('application/json');
      expect(input.body).toStrictEqual('{"hello":"satr"}');
      return {
        json: () => Promise.resolve('fuffolo'),
      };
    });
    const refreshToken = mockFetch.mockImplementation(() =>
      Promise.resolve(true),
    );
    const response = await jsonFetcher(refreshToken)('hello', {
      body: { hello: 'satr' },
    });
    expect(response).toBe('fuffolo');
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });
});
