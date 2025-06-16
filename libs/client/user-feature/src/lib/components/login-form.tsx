import { FormProvider, useForm } from 'react-hook-form';
import { classValidatorResolver } from '@hookform/resolvers/class-validator';
import { UserLoginDto } from '@unic/shared/user-dto';
import {
  Button,
  ButtonText,
  CheckboxFormInput,
  InputTextFormInput,
} from '@unic/core-ui';
import { useEffect, useState } from 'react';
import { atom } from 'nanostores';
import { makeCustomFunctionLogin } from '@unic/client-global-data-access';

const resolver = classValidatorResolver(UserLoginDto);

type LoginFormProps = {
  onCreateAccountClick?: (() => void) | null;
  onLogin(): void;
  onForgotPasswordClick?: (() => void) | null;
};

export const onLoginAtom = atom<(() => void) | null>(null);

export function LoginForm(props: LoginFormProps) {
  const [isError, setError] = useState(false);
  const [isRememberMe, setRememberMe] = useState(false);
  const [isLogin, setLogin] = useState(false);
  const [emailToSet, setEmailToSet] = useState('');

  const formMethods = useForm({
    resolver,
  });

  function setErrorLogin() {
    setError(true);
  }

  useEffect(() => {
    const emailStorage = window.localStorage.getItem('unic-email-login') ?? '';
    setEmailToSet(emailStorage);
    formMethods.reset({
      ...{
        email: emailStorage,
        rememberme: emailStorage.length > 0 ? true : false,
      },
    });
  }, [formMethods]);

  useEffect(() => {
    const emailToSetStorage = isRememberMe ? emailToSet : '';
    if (isLogin) {
      window.localStorage.setItem('unic-email-login', emailToSetStorage);
    }
  }, [isLogin, isRememberMe, emailToSet]);

  return (
    <div className="flex flex-col gap-4 min-w-[352px]">
      <h2 className="text-xl font-semibold text-gray-900">Log in</h2>
      <FormProvider {...formMethods}>
        <form
          onSubmit={formMethods.handleSubmit(async (values) => {
            try {
              const loginResult = await makeCustomFunctionLogin(
                values as UserLoginDto,
              );
              if (loginResult.status) {
                setRememberMe(values.rememberme ?? false);
                setEmailToSet(values.email ?? '');
                setLogin(true);
                props.onLogin();
                if (onLoginAtom.get()) {
                  onLoginAtom.get()?.();
                  onLoginAtom.set(null);
                }
                return;
              }
              setErrorLogin();
              return;
            } catch (error) {
              setErrorLogin();
            }
          })}
          className="flex flex-col gap-4"
        >
          <InputTextFormInput
            label="Your email"
            name="email"
            placeholder="name@company.com"
            type="email"
            required
          />
          <InputTextFormInput
            label="Password"
            name="password"
            placeholder="••••••••"
            type="password"
            required
          />
          {isError && (
            <span className="text-sm font-medium text-red-500">
              Invalid email or password
            </span>
          )}
          <div className="flex justify-between">
            <CheckboxFormInput name="rememberme" label="Remember me" />
            <ButtonText onClick={() => props?.onForgotPasswordClick?.()}>
              <span className="cursor-pointer">Forgot password?</span>
            </ButtonText>
          </div>
          <Button isSubmit type="primary" size="regular">
            Login
          </Button>
          <span
            onClick={() => props?.onCreateAccountClick?.()}
            className="text-sm font-medium text-gray-500"
          >
            Not registered? <ButtonText>Create an account</ButtonText>
          </span>
          {/* <div className="m-auto w-[233px] h-px bg-gray-500" />
          <span className="text-sm text-gray-500">
            Or <b>log in</b> with your home institution
          </span> */}
        </form>
      </FormProvider>
    </div>
  );
}
