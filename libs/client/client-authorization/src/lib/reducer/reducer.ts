import { createReducer } from '@reduxjs/toolkit';
import {
  loggedInAction,
  doLogInAction,
  loggedOutAction,
  doLogOutAction,
  tokenRefreshedAction,
  loginErrorAction,
  loggedOutErrorAction,
  refreshUserLoginStatus,
  loggedInPassworlessAction,
} from './actions';

export interface AuthorizationStateInterface {
  loading: boolean;
  isLoggedIn: boolean;
  error?: {
    statusCode: number;
    message: string;
    error: string;
  };
  user?: {
    tokens?: {
      authorizationToken?: string;
      refreshToken?: string;
    };
  };
  config: {
    transport: 'cookie' | 'header';
    type: 'password';
    customLoginCall?: (
      actionPayload: ReturnType<typeof doLogInAction>['payload'],
    ) => Promise<{ authorization_token?: string; refresh_token?: string }>;
    customBasePathUrl?: string;
    fetchCredentialsSend?: 'omit' | 'include' | 'same-origin';
  };
}

const CUSTOM_BASE_PATH = '';
const FETCH_CREDENTIALS_SEND = 'same-origin';

export function getCustomBasePath(state: AuthorizationStateInterface) {
  return state.config.customBasePathUrl ?? CUSTOM_BASE_PATH;
}

export function getFetchCredentialsSend(state: AuthorizationStateInterface) {
  return state.config.fetchCredentialsSend ?? FETCH_CREDENTIALS_SEND;
}

export const initialAuthorizationState: AuthorizationStateInterface = {
  loading: false,
  isLoggedIn: false,
  config: {
    transport: 'cookie',
    type: 'password',
  },
};

export const authorizationReducer = createReducer(
  initialAuthorizationState,
  (bulder) => {
    bulder
      .addCase(doLogOutAction, (state) => {
        state.loading = true;
      })
      .addCase(loggedOutAction, (state) => {
        state.loading = false;
        state.isLoggedIn = false;
        state.user = undefined;
      })
      .addCase(doLogInAction, (state) => {
        state.loading = true;
        state.error = undefined;
      })
      .addCase(loggedInAction, (state, action) => {
        state.loading = false;
        state.isLoggedIn = true;
        if (action.payload.authorizationToken && action.payload.refreshToken) {
          state.user = {
            tokens: {
              refreshToken: action.payload.refreshToken,
              authorizationToken: action.payload.authorizationToken,
            },
          };
        }
      })
      .addCase(loggedInPassworlessAction, (state) => {
        state.loading = false;
        state.isLoggedIn = true;
      })
      .addCase(tokenRefreshedAction, (state, action) => {
        if (action.payload) {
          state.user = {
            tokens: {
              authorizationToken: action.payload,
            },
          };
        }
      })
      .addCase(loggedOutErrorAction, (state, action) => {
        state.loading = false;
        state.isLoggedIn = false;
        state.user = undefined;
        state.error = action.payload.error;
      })
      .addCase(loginErrorAction, (state, action) => {
        state.loading = false;
        state.error = action.payload.error;
      })
      .addCase(refreshUserLoginStatus, (state, action) => {
        state.isLoggedIn = action.payload.isLoggedIn;
        if (action.payload.refreshToken) {
          state.user = {
            tokens: {
              refreshToken: action.payload.refreshToken,
            },
          };
        }
      });
  },
);
