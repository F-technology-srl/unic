import { useHandleRespError } from '@unic/client-global-data-access';
import { CreateUserDto, UserDto } from '@unic/shared/user-dto';
import { useFetcher } from '@unic/client-authorization';

export function useCreateUser() {
  const fetcher = useFetcher();
  const { error, handle } = useHandleRespError(true);

  async function createUser(data: CreateUserDto) {
    const result = await fetcher(`/api/users`, {
      method: 'POST',
      body: data,
    });

    return handle<UserDto>(result);
  }

  return {
    error,
    createUser,
  };
}
