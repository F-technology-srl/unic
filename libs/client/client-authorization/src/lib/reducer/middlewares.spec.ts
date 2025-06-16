import { mockFetch } from '../utils/mock-fetch.util';
import { doLogInAction, doLogOutAction } from './actions';
import { loginMiddleware, logoutMiddleware } from './middlewares';

describe('Test authorization middlewares', () => {
  afterEach(() => {
    mockFetch.mockReset();
  });

  it('Should perform the login action', (done) => {
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
      if (action.type === 'loggedIn') {
        expect(dispatch).toHaveBeenCalledTimes(2);
        done();
      }
      if (action.type === 'loginError') {
        done(
          new Error(
            `Should not end up here, the test have failed. Maybe the error message will help:\n ${action.payload.error.message}`,
          ),
        );
      }
    });

    loginMiddleware(
      {
        loading: false,
        isLoggedIn: false,
        config: {
          transport: 'cookie',
          type: 'password',
          customBasePathUrl,
          fetchCredentialsSend,
        },
      },
      doLogInAction({ username: 'peppino', password: 'batuffolo' }),
      dispatch,
    );
  });

  it('Should emit an error event when login fail', (done) => {
    mockFetch.mockImplementation((input, init) => {
      return Promise.resolve({
        json: () =>
          Promise.resolve({
            error: 'Bello si è spaccato il server',
            message: 'Bello si è spaccato il server',
          }),
        ok: false,
        status: 400,
      });
    });

    const dispatch = jest.fn().mockImplementation((action) => {
      if (action.type === 'loggedIn') {
        done(new Error('Should not end up here'));
      }
      if (action.type === 'loginError') {
        expect(action.payload.error.message);
        expect(dispatch).toHaveBeenCalledTimes(2);
        done();
      }
    });

    loginMiddleware(
      {
        loading: false,
        isLoggedIn: false,
        config: {
          transport: 'cookie',
          type: 'password',
        },
      },
      doLogInAction({ username: 'peppino', password: 'batuffolo' }),
      dispatch,
    );
  });

  it('Should support custom login function', (done) => {
    const dispatch = jest.fn().mockImplementation((action) => {
      if (action.type === 'loggedIn') {
        expect(customLoginCall).toHaveBeenCalledTimes(1);
        expect(dispatch).toHaveBeenCalledTimes(2);
        expect(action.payload.authorizationToken).toBe('tokennn');
        done();
      }
      if (action.type === 'loginError') {
        done(
          new Error(
            `Should not end up here, the test have failed. Maybe the error message will help:\n ${action.payload.error.message}`,
          ),
        );
      }
    });

    const customLoginCall = jest.fn().mockImplementation((options) => {
      expect(options.metadata.type).toBe('admin');
      return Promise.resolve({
        authorization_token: 'tokennn',
      });
    });

    loginMiddleware(
      {
        loading: false,
        isLoggedIn: false,
        config: {
          transport: 'cookie',
          type: 'password',
          customLoginCall,
        },
      },
      doLogInAction({
        username: 'peppino',
        password: 'batuffolo',
        metadata: { type: 'admin' },
      }),
      dispatch,
    );
  });

  it('Should perform the logout action', (done) => {
    const customBasePathUrl = 'http://localhost:4300';
    const fetchCredentialsSend = 'omit';
    mockFetch.mockImplementation((input, init) => {
      expect(input).toContain(customBasePathUrl);
      expect(init.credentials).toBe(fetchCredentialsSend);
      return Promise.resolve({
        json: null,
        ok: true,
      });
    });

    const dispatch = jest.fn().mockImplementation((action) => {
      if (action.type === 'loggedOut') {
        expect(dispatch).toHaveBeenCalledTimes(2);
        done();
      }
      if (action.type === 'loggedOutError') {
        done(
          new Error(
            `Should not end up here, the test have failed. Maybe the error message will help:\n ${action.payload.error.message}`,
          ),
        );
      }
    });

    logoutMiddleware(
      {
        loading: false,
        isLoggedIn: true,
        config: {
          transport: 'cookie',
          type: 'password',
          customBasePathUrl,
          fetchCredentialsSend,
        },
      },
      doLogOutAction(),
      dispatch,
    );
  });

  it('Should emit error action when logout fail', (done) => {
    mockFetch.mockImplementation((input, init) => {
      return Promise.resolve({
        json: () =>
          Promise.resolve({
            error: 'Bello si è spaccato il server',
            message: 'Bello si è spaccato il server',
          }),
        ok: false,
        status: 400,
      });
    });

    const dispatch = jest.fn().mockImplementation((action) => {
      if (action.type === 'loggedOut') {
        done(new Error('Should not end up here'));
      }
      if (action.type === 'loggedOutError') {
        expect(dispatch).toHaveBeenCalledTimes(2);
        done();
      }
    });

    logoutMiddleware(
      {
        loading: false,
        isLoggedIn: true,
        config: {
          transport: 'cookie',
          type: 'password',
        },
      },
      doLogOutAction(),
      dispatch,
    );
  });
});
