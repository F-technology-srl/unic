import { FormProvider, useForm } from 'react-hook-form';
import { classValidatorResolver } from '@hookform/resolvers/class-validator';
import { ResetPasswordDto } from '@unic/shared/user-dto';
import { Button, InputTextFormInput } from '@unic/core-ui';
import { useState } from 'react';
import { useResetPassword } from '../data-access/reset-password.hook';

const resolver = classValidatorResolver(ResetPasswordDto);

export interface ResetPasswordFormProps {
  token: string;
}

export function ResetPasswordForm(props: ResetPasswordFormProps) {
  const formMethods = useForm<ResetPasswordDto>({
    resolver,
    defaultValues: {
      token: props.token,
    },
  });
  const { resetPassword, error: errorReset } = useResetPassword();
  const [errorMessage, setErrorMessage] = useState<string | null | undefined>(
    null,
  );

  return (
    <div className="flex flex-1 flex-col gap-4 self-center w-[516px] mt-[56px]">
      <h2 className="text-xl font-semibold text-gray-900">Reset password</h2>
      <p>Enter your new password below.</p>
      <FormProvider {...formMethods}>
        <form
          onSubmit={formMethods.handleSubmit(async (values) => {
            try {
              const initResetPasswordResult = await resetPassword(values);
              if (initResetPasswordResult?.success) {
                setErrorMessage(null);
                window.location.href = '/';
                // TODO show toast
                return;
              }
            } catch (error) {
              setErrorMessage(errorReset);
            }
          })}
          className="flex flex-col gap-4"
        >
          <InputTextFormInput
            label="Password"
            name="password"
            placeholder="••••••••"
            type="password"
            required
          />
          {errorMessage && (
            <span className="text-sm font-medium text-red-500">
              {errorMessage}
            </span>
          )}

          <InputTextFormInput
            label="Confirm password"
            name="repeat_password"
            placeholder="••••••••"
            type="password"
            required
          />
          {errorMessage && (
            <span className="text-sm font-medium text-red-500">
              {errorMessage}
            </span>
          )}

          <Button isSubmit type="primary" size="regular">
            Save
          </Button>
        </form>
      </FormProvider>
    </div>
  );
}
