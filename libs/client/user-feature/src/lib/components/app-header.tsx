import { Header, ModalHandle, UserHeader } from '@unic/core-ui';
import { LoginForm } from './login-form';
import { RegistrationForm } from './registration-form';
import { useGetUserMe } from '../data-access/get-user.hook';
import { useEffect, useRef } from 'react';
import { atom } from 'nanostores';
import { InitResetPasswordForm } from './init-reset-password-form';
import { UserDto } from '@unic/shared/user-dto';
import { makeCustomFunctionLogout } from '@unic/client-global-data-access';

export interface AppHeaderProps {
  require_login?: boolean;
  hideHeaderButtons?: boolean;
  require_admin?: boolean;
}

export const openLoginAtom = atom<(() => void) | null>(null);
export const currentUserLoggedAtom = atom<UserDto | null | undefined>();

export function AppHeader(props: AppHeaderProps) {
  const {
    data: userCurrent,
    isLoading,
    error,
    mutate: userInfoMutate,
  } = useGetUserMe();

  const loginRef = useRef<ModalHandle>(null);
  const registerRef = useRef<ModalHandle>(null);
  const initialResetPasswordRef = useRef<ModalHandle>(null);

  useEffect(() => {
    currentUserLoggedAtom.set(userCurrent);

    if (props.require_login && error) {
      window.location.href = '/';
    }
    //not logged in - logged not admin
    if (
      (props.require_admin && error) ||
      (props.require_admin &&
        userCurrent &&
        userCurrent?.platform_role !== 'administrator')
    ) {
      window.location.href = '/';
    }
  }, [error, props.require_admin, props.require_login, userCurrent]);

  function onCreateAccountClick() {
    loginRef.current?.toggleState();
    registerRef.current?.toggleState();
  }

  function onLoginDone() {
    loginRef.current?.toggleState();
    userInfoMutate();
  }

  async function onLogoutClick() {
    await makeCustomFunctionLogout();
    userInfoMutate();
  }
  function onOpenForgotPsw() {
    initialResetPasswordRef.current?.toggleState();
    loginRef.current?.toggleState();
  }

  function initialResetOnBackToLogin() {
    initialResetPasswordRef.current?.toggleState();
    loginRef.current?.toggleState();
  }

  function onResetPasswordSend() {
    initialResetPasswordRef.current?.toggleState();
  }

  openLoginAtom.set(() => loginRef.current?.toggleState());

  return (
    <Header
      logout={onLogoutClick}
      loginForm={
        <LoginForm
          onCreateAccountClick={onCreateAccountClick}
          onLogin={onLoginDone}
          onForgotPasswordClick={onOpenForgotPsw}
        />
      }
      loginRef={loginRef}
      registerRef={registerRef}
      registerForm={<RegistrationForm />}
      initResetPasswordForm={
        <InitResetPasswordForm
          onBackToLogin={initialResetOnBackToLogin}
          onResetPasswordSend={onResetPasswordSend}
        />
      }
      user={userCurrent as UserHeader}
      isLoading={isLoading}
      initialResetPasswordRef={initialResetPasswordRef}
      hideHeaderButtons={props.hideHeaderButtons}
    />
  );
}

export default AppHeader;
