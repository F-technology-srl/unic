import { FormProvider, useForm } from 'react-hook-form';
import { classValidatorResolver } from '@hookform/resolvers/class-validator';
import { InitResetPasswordDto } from '@unic/shared/user-dto';
import { Button, InputTextFormInput } from '@unic/core-ui';
import { useState } from 'react';
import { useResetPassword } from '../data-access/reset-password.hook';

const resolver = classValidatorResolver(InitResetPasswordDto);

type InitResetPasswordFormProps = {
  onBackToLogin: () => void;
  onResetPasswordSend: () => void;
};

export function InitResetPasswordForm(props: InitResetPasswordFormProps) {
  const formMethods = useForm<InitResetPasswordDto>({ resolver });
  const { initResetPassword } = useResetPassword();
  const [isError, setError] = useState(false);
  const [sendEmailReset, setSendEmailReset] = useState(false);

  function setErrorEmail(status: boolean) {
    setError(status);
  }

  return (
    <div className="flex flex-col gap-4 min-w-[352px]">
      <h2 className="text-xl font-semibold text-gray-900">Forgot password?</h2>

      {!sendEmailReset && (
        <>
          <p>We will send you reset instructions by email</p>
          <FormProvider {...formMethods}>
            <form
              onSubmit={formMethods.handleSubmit(async (values) => {
                try {
                  const initResetPasswordResult =
                    await initResetPassword(values);
                  if (initResetPasswordResult?.success) {
                    setErrorEmail(false);
                    // props.onResetPasswordSend();
                    setSendEmailReset(true);
                  }
                  setErrorEmail(true);
                  return;
                } catch (error) {
                  setErrorEmail(true);
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
              {isError && (
                <span className="text-sm font-medium text-red-500">
                  Invalid email
                </span>
              )}
              <Button isSubmit type="primary" size="regular">
                Reset password
              </Button>
            </form>
          </FormProvider>
          <span
            className="cursor-pointer"
            data-modal-target={`modal-init-reset-password`}
            data-modal-hide={`modal-init-reset-password`}
            data-modal-toggle={`modal-login`}
          >
            <Button
              type="secondary"
              size="regular"
              onClick={props.onBackToLogin}
              classButton=" w-full"
            >
              Back to login
            </Button>
          </span>
        </>
      )}
      {sendEmailReset && (
        <p>
          The password reset email has been sent to your inbox. Please check
          your email and follow the instructions to reset your password.
        </p>
      )}
    </div>
  );
}
