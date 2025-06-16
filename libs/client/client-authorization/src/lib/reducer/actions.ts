import { createAction } from '@reduxjs/toolkit';

export const doLogInAction = createAction<{
  username: string;
  password?: string;
  metadata?: unknown;
}>('doLogin');
export const loginErrorAction = createAction<{
  error: {
    statusCode: number;
    message: string;
    error: string;
  };
}>('loginError');
export const loggedInAction = createAction<{
  authorizationToken: string | null | undefined;
  refreshToken: string | null | undefined;
}>('loggedIn');
export const loggedInPassworlessAction = createAction(
  'loggedInPassworlessAction',
);
export const tokenRefreshedAction = createAction<string | null | undefined>(
  'tokenRefreshed',
);
export const doLogOutAction = createAction('doLogOut');
export const loggedOutAction = createAction('loggedOut');
export const loggedOutErrorAction = createAction<{
  error: {
    statusCode: number;
    message: string;
    error: string;
  };
}>('loggedOutError');
export const refreshUserLoginStatus = createAction<{
  isLoggedIn: boolean;
  refreshToken: string | null | undefined;
}>('refreshUserLoginStatus');

export type AuthorizationActions = ReturnType<
  | typeof doLogInAction
  | typeof loggedInAction
  | typeof tokenRefreshedAction
  | typeof doLogOutAction
  | typeof loggedOutAction
  | typeof refreshUserLoginStatus
  | typeof loginErrorAction
  | typeof loggedOutErrorAction
  | typeof loggedInPassworlessAction
>;
