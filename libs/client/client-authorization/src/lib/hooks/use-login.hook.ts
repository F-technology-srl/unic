import { useContext } from 'react';
import { AuthorizationContext } from '../context';
import { doLogInAction, doLogOutAction } from '../reducer';

export function useLogin() {
  const authContext = useContext(AuthorizationContext);

  return {
    loading: authContext.state.loading,
    loggedIn: authContext.state.isLoggedIn,
    error: authContext.state.error,
    login: (credential: { username: string; password: string }) => {
      authContext.dispatch(doLogInAction(credential));
    },
    logout: () => {
      authContext.dispatch(doLogOutAction());
    },
  };
}
