import { createContext, Dispatch, PropsWithChildren, useEffect } from 'react';
import {
  authorizationReducer,
  AuthorizationStateInterface,
  initialAuthorizationState,
} from '../reducer/reducer';
import {
  AuthorizationActions,
  refreshUserLoginStatus,
} from '../reducer/actions';
import {
  loginMiddleware,
  logoutMiddleware,
  useReducerWithMiddleware,
} from '../reducer/middlewares';

export const AuthorizationContext = createContext<{
  state: AuthorizationStateInterface;
  dispatch: Dispatch<AuthorizationActions>;
}>({
  state: initialAuthorizationState,
  dispatch: () => null,
});

export interface ClientAuthenticationProviderProps {
  transport: AuthorizationStateInterface['config']['transport'];
  type: AuthorizationStateInterface['config']['type'];
  overrideCustomLoginCall?: AuthorizationStateInterface['config']['customLoginCall'];
  overrideStateAndDipatch?: {
    state: AuthorizationStateInterface;
    dispatch: Dispatch<AuthorizationActions>;
  };
  customBasePathUrl?: string;
  fetchCredentialsSend?: 'omit' | 'include' | 'same-origin';
}

export const ClientAuthenticationProvider = (
  props: PropsWithChildren<ClientAuthenticationProviderProps>,
) => {
  const refreshToken = window.localStorage.getItem('x-auth-refresh-token');

  const [state, dispatch] = useReducerWithMiddleware<
    AuthorizationStateInterface,
    AuthorizationActions
  >(
    authorizationReducer,
    {
      loading: false,
      isLoggedIn: window.localStorage.getItem('x-auth-is-logged-in') === 'true',
      config: {
        transport: props.transport,
        type: props.type,
        customLoginCall: props.overrideCustomLoginCall,
        customBasePathUrl: props.customBasePathUrl,
        fetchCredentialsSend: props.fetchCredentialsSend,
      },
      user: refreshToken ? { tokens: { refreshToken } } : undefined,
    },
    [loginMiddleware, logoutMiddleware],
  );

  useEffect(() => {
    if (state?.user?.tokens?.refreshToken) {
      window.localStorage.setItem(
        'x-auth-refresh-token',
        state?.user?.tokens?.refreshToken,
      );
    }
    window.localStorage.setItem(
      'x-auth-is-logged-in',
      String(state?.isLoggedIn),
    );
  }, [state?.isLoggedIn, state?.user?.tokens?.refreshToken]);

  console.info(
    `%c [@f-technology-srl/client-authorization]: isloggedIn: ${state?.isLoggedIn} loading: ${state?.loading}`,
    'background: #222; color: #bada55',
  );

  return (
    <AuthorizationContext.Provider
      value={
        props.overrideStateAndDipatch
          ? props.overrideStateAndDipatch
          : {
              state,
              dispatch,
            }
      }
    >
      {props.children}
    </AuthorizationContext.Provider>
  );
};
