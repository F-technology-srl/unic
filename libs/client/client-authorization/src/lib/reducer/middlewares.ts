import { Dispatch, Reducer, useCallback, useReducer } from 'react';
import {
  AuthorizationStateInterface,
  getCustomBasePath,
  getFetchCredentialsSend,
} from './reducer';
import {
  AuthorizationActions,
  doLogInAction,
  doLogOutAction,
  loggedInAction,
  loggedOutAction,
  loggedOutErrorAction,
  loginErrorAction,
} from './actions';

export type MiddlewareType<StateType, ActionType> = (
  state: StateType,
  action: ActionType,
  dispatch: Dispatch<ActionType>,
) => void;

export function useReducerWithMiddleware<StateType, ActionsType>(
  mainReducer: Reducer<StateType, ActionsType>,
  initialState: StateType,
  middlewares: Array<MiddlewareType<StateType, ActionsType>> = [],
): [StateType, Dispatch<ActionsType>] {
  // useReducer<Reducer<StateType, ActionsType>>(  -> dava errore, rimosso il tipo
  const [state, dispatch] = useReducer(mainReducer, initialState);
  const dispatchWithMiddlewares = useCallback(
    (action: ActionsType) => {
      for (const middleware of middlewares) {
        middleware(state, action, dispatch);
      }
    },
    [middlewares, state, dispatch],
  );

  return [state, dispatchWithMiddlewares];
}

export function loginMiddleware(
  state: AuthorizationStateInterface,
  action: AuthorizationActions,
  dispatch: Dispatch<AuthorizationActions>,
) {
  dispatch(action);

  if (doLogInAction.match(action) && state.config.type === 'password') {
    if (state.config.customLoginCall) {
      state.config
        .customLoginCall(action.payload)
        .then((tokens) => {
          dispatch(
            loggedInAction({
              authorizationToken: tokens.authorization_token,
              refreshToken: tokens.refresh_token,
            }),
          );
        })
        .catch((error) => {
          dispatch(
            loginErrorAction({
              error: {
                error: error.message,
                message: error.message,
                statusCode: error.statusCode,
              },
            }),
          );
        });
      return;
    }

    const transport = state.config.transport;

    fetch(
      `${getCustomBasePath(
        state,
      )}/api/auth/login?transport=${transport}&type=password`,
      {
        method: 'POST',
        body: JSON.stringify(action.payload),
        credentials: getFetchCredentialsSend(state),
        headers: {
          'content-type': 'application/json',
        },
      },
    )
      .then((result) =>
        result.ok
          ? result
              .json()
              .then((body) => ({ body, error: '', statusCode: result.status }))
          : result.json().then((body) => ({
              body,
              error: result.statusText,
              statusCode: result.status,
            })),
      )
      .then(({ body, error, statusCode }) => {
        if (body.error || error !== '') {
          const bodyHasMessage = !!body.message;
          dispatch(
            loginErrorAction({
              error: bodyHasMessage
                ? body
                : {
                    error: error,
                    message: error,
                    statusCode: statusCode,
                  },
            }),
          );
        } else {
          dispatch(
            loggedInAction({
              authorizationToken: body.authorization_token,
              refreshToken: body.refresh_token,
            }),
          );
        }
      })
      .catch((error) => {
        dispatch(
          loginErrorAction({
            error: {
              error: error.message,
              message: error.message,
              statusCode: 0,
            },
          }),
        );
      });
  }
}

export function logoutMiddleware(
  state: AuthorizationStateInterface,
  action: AuthorizationActions,
  dispatch: Dispatch<AuthorizationActions>,
) {
  dispatch(action);

  if (doLogOutAction.match(action)) {
    const transport = state.config.transport;
    const headers = new Headers();
    if (transport === 'header') {
      headers.set(
        'authorization',
        `Bearer ${state.user?.tokens?.authorizationToken}`,
      );
    }

    fetch(
      `${getCustomBasePath(state)}/api/auth/logout?transport=${transport}`,
      {
        method: 'POST',
        headers,
        credentials: getFetchCredentialsSend(state),
      },
    )
      .then((result) => {
        if (result.ok) {
          return null;
        }
        return result.json();
      })
      .then((body) => {
        if (body?.error) {
          dispatch(loggedOutErrorAction({ error: body }));
        } else {
          dispatch(loggedOutAction());
        }
      })
      .catch((error) => {
        dispatch(
          loggedOutErrorAction({
            error: {
              error: error.message,
              message: error.message,
              statusCode: 0,
            },
          }),
        );
      });
  }
}
