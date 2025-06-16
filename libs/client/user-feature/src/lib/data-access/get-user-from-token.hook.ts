import useSwr from 'swr';
import { useHandleRespError } from '@unic/client-global-data-access';
import { UserDto } from '@unic/shared/user-dto';
import { useFetcher } from '@unic/client-authorization';

export function useGetUserFromToken(props: { token: string }) {
  const fetcher = useFetcher();
  const { handle, error } = useHandleRespError(false);

  const result = useSwr<UserDto>(`/api/users/info/${props.token}`, fetcher);

  const data = handle<UserDto>(result.data);

  return {
    ...result,
    data,
    error,
  };
}
