import { mockFetch } from '../utils/mock-fetch.util';
import { makeRefreshToken } from './use-fetcher.hook';

describe('Test authorization middlewares', () => {
  afterEach(() => {
    mockFetch.mockReset();
  });

  it('Should perform makeRefreshToken ok', async () => {
    const customBasePathUrl = 'http://localhost:4300';
    const fetchCredentialsSend = 'omit';
    mockFetch.mockImplementation((input, init) => {
      expect(input).toContain(customBasePathUrl);
      expect(init.credentials).toBe(fetchCredentialsSend);
      return Promise.resolve({
        json: () => Promise.resolve({}),
        ok: true,
      });
    });

    const dispatch = jest.fn().mockImplementation((action) => {
      expect(action.type).toBe('tokenRefreshed');
      //   done();
    });
    const refreshTokenFunction = await makeRefreshToken(
      dispatch,
      {
        loading: false,
        isLoggedIn: false,
        config: {
          transport: 'header',
          type: 'password',
          customBasePathUrl,
          fetchCredentialsSend,
        },
      },
      'refresh_token',
    );
    const resultRT = await refreshTokenFunction();
    expect(resultRT).toBe(true);
  });

  it('Should perform makeRefreshToken not ok', async () => {
    mockFetch.mockImplementation((input, init) => {
      return Promise.resolve({
        json: () => Promise.resolve({}),
        ok: false,
      });
    });

    const dispatch = jest.fn().mockImplementation((action) => {
      console.log('action', action);
      expect(action.type).toBe('doLogOut');
      //   done();
    });
    const refreshTokenFunction = await makeRefreshToken(
      dispatch,
      {
        loading: false,
        isLoggedIn: false,
        config: {
          transport: 'header',
          type: 'password',
        },
      },
      'refresh_token',
    );
    const resultRT = await refreshTokenFunction();
    expect(resultRT).toBe(false);
  });
});
