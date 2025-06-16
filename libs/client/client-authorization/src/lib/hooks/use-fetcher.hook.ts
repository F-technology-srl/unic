import { Dispatch, useContext, useMemo } from 'react';
import { AuthorizationContext } from '../context';
import {
  AuthorizationActions,
  doLogOutAction,
  tokenRefreshedAction,
} from '../reducer/actions';
import { fetcher, jsonFetcher } from '../utils/fetcher';
import {
  AuthorizationStateInterface,
  getCustomBasePath,
  getFetchCredentialsSend,
} from '../reducer';

export function makeRefreshToken(
  dispatch: Dispatch<AuthorizationActions>,
  state: AuthorizationStateInterface,
  refreshToken?: string,
) {
  return async () => {
    const headers = new Headers();
    let body = undefined;
    let transport = 'cookie';
    if (refreshToken) {
      headers.set('content-type', 'application/json');
      body = JSON.stringify({
        refresh_token: refreshToken,
      });
      transport = 'header';
    }

    const response = await fetch(
      `${getCustomBasePath(state)}/api/auth/refresh?transport=${transport}`,
      {
        headers,
        method: 'POST',
        body,
        credentials: getFetchCredentialsSend(state),
      },
    );
    const respBody = await response.json();
    if (response.ok) {
      dispatch(tokenRefreshedAction(respBody.authorization_token));
      return true;
    } else {
      dispatch(doLogOutAction());
      return false;
    }
  };
}

export function useRefreshToken() {
  const authContext = useContext(AuthorizationContext);
  const refreshToken = useMemo(
    () =>
      makeRefreshToken(
        authContext.dispatch,
        authContext.state,
        authContext.state?.user?.tokens?.refreshToken,
      ),
    [authContext.dispatch, authContext.state?.user?.tokens?.refreshToken],
  );
  return refreshToken;
}

export function usePlainFetcher() {
  const authContext = useContext(AuthorizationContext);

  const refreshToken = useMemo(
    () =>
      makeRefreshToken(
        authContext.dispatch,
        authContext.state,
        authContext.state?.user?.tokens?.refreshToken,
      ),
    [authContext.dispatch, authContext.state?.user?.tokens?.refreshToken],
  );

  return fetcher(
    refreshToken,
    authContext.state?.user?.tokens?.authorizationToken,
  );
}

export function useFetcher() {
  const authContext = useContext(AuthorizationContext);

  const refreshToken = useMemo(
    () =>
      makeRefreshToken(
        authContext.dispatch,
        authContext.state,
        authContext.state?.user?.tokens?.refreshToken,
      ),
    [authContext.dispatch, authContext.state?.user?.tokens?.refreshToken],
  );

  return jsonFetcher(
    refreshToken,
    authContext.state?.user?.tokens?.authorizationToken,
  );
}
