import { InitResetPasswordDto, ResetPasswordDto } from '@unic/shared/user-dto';
import { useHandleRespError } from '@unic/client-global-data-access';
import { useFetcher } from '@unic/client-authorization';

export function useResetPassword() {
  const fetcher = useFetcher();
  const { error, handle } = useHandleRespError();

  async function initResetPassword(data: InitResetPasswordDto) {
    const result = await fetcher(`/api/users/init-reset-password`, {
      method: 'POST',
      body: data,
    });

    return handle<{ success: boolean }>(result);
  }

  async function resetPassword(data: ResetPasswordDto) {
    const result = await fetcher(`/api/users/reset-password`, {
      method: 'POST',
      body: data,
    });

    return handle<{ success: boolean }>(result);
  }

  return {
    error,
    initResetPassword,
    resetPassword,
  };
}
