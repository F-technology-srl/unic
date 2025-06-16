import { FormProvider, useForm } from 'react-hook-form';
import { classValidatorResolver } from '@hookform/resolvers/class-validator';
import { CreateUserDto } from '@unic/shared/user-dto';
import {
  Button,
  CheckboxFormInput,
  InputTextFormInput,
  TextareaFormInput,
} from '@unic/core-ui';
import { useCreateUser } from '../data-access';
import { useState } from 'react';

const resolver = classValidatorResolver(CreateUserDto);

export function RegistrationForm() {
  const formMethods = useForm<CreateUserDto>({ resolver });
  const { createUser, error } = useCreateUser();
  const [isRegisterDone, setRegisterDone] = useState(false);
  const [isError, setError] = useState(false);
  const [isRegisterLoading, setRegisterLoading] = useState(false);

  const conditions = formMethods.watch('conditions');
  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-xl font-semibold text-gray-900">Apply to sign up</h2>
      {!isRegisterDone && (
        <FormProvider {...formMethods}>
          <form
            onSubmit={formMethods.handleSubmit(async (values) => {
              console.log('values', values);
              try {
                setRegisterLoading(true);
                const registerResult = await createUser(values);
                if (registerResult?.user_uuid) {
                  setRegisterDone(true);
                }
                setError(true);
                return;
              } catch (error) {
                setError(true);
              }
              setRegisterDone(false);
              return createUser(values);
            })}
            className="flex flex-col gap-4"
          >
            <div className="flex gap-4">
              <InputTextFormInput
                label="Given name"
                name="first_name"
                placeholder="John"
                required
                className="w-full"
              />
              <InputTextFormInput
                label="Surname"
                name="last_name"
                placeholder="Smith"
                required
                className="w-full"
              />
            </div>
            <InputTextFormInput
              label="Profession"
              name="profession"
              placeholder="Researcher"
            />
            <InputTextFormInput
              label="Institution"
              name="institution"
              placeholder="University of Bologna"
            />
            <TextareaFormInput
              label="Briefly explain your planned use of the UNIC data"
              name="explanation"
              placeholder="Write text here ..."
              rows={5}
              required
            />
            <InputTextFormInput
              label="Your email"
              name="email"
              placeholder="name@company.com"
              type="email"
              required
            />
            <InputTextFormInput
              label="Password (repeat for validation)"
              name="password"
              placeholder="••••••••"
              type="password"
              required
            />
            <InputTextFormInput
              name="repeat_password"
              placeholder="••••••••"
              type="password"
              required
            />
            <CheckboxFormInput
              name="conditions"
              label={
                <span className="text-sm font-medium">
                  I accept the UNIC{' '}
                  <a
                    href="/unic_terms_conditions.pdf"
                    target="_balnk"
                    className="text-blue-800 hover:underline"
                  >
                    Terms and Conditions of Use
                  </a>{' '}
                  and{' '}
                  <a
                    href="/unic_privacy_policy.pdf"
                    target="_balnk"
                    className="text-blue-800 hover:underline"
                  >
                    Privacy Policy
                  </a>
                  .
                </span>
              }
            />

            {!isRegisterLoading && (
              <Button
                isSubmit
                type="primary"
                size="regular"
                disabled={!conditions}
              >
                Request approval
              </Button>
            )}
            <span className="text-xs text-gray-500">
              We’ll email you the registration result in 1-2 working days
            </span>
            {isError && (
              <span className="text-sm font-medium text-red-500">{error}</span>
            )}
          </form>
        </FormProvider>
      )}
      {isRegisterDone && (
        <span className="text-sm font-medium text-green-500">
          Registration request created successfully
        </span>
      )}
    </div>
  );
}
