import { useHandleRespError } from '@unic/client-global-data-access';
import { ApprovalEnum } from '@unic/shared/user-dto';
import { useFetcher } from '@unic/client-authorization';

export function useApprovalUser() {
  const fetcher = useFetcher();
  const { error, handle } = useHandleRespError(true);

  async function approvalUser(props: { token: string; action: ApprovalEnum }) {
    const result = await fetcher(
      `/api/users/verify/${props.action}/token/${props.token}`,
      {
        method: 'GET',
      },
    );

    return handle<{ url: string }>(result);
  }

  return {
    error,
    approvalUser,
  };
}
