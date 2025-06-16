import { Button, Loader } from '@unic/core-ui';
import { useApprovalUser, useGetUserFromToken } from '../data-access';
import { ApprovalEnum } from '@unic/shared/user-dto';
import { useState } from 'react';
import { UserStatusEnum } from '@unic/shared/database-dto';

export interface UserApprovalPageProps {
  token: string;
}

export function UserApprovalPage(props: UserApprovalPageProps) {
  const { data, error, isLoading } = useGetUserFromToken({
    token: props.token,
  });
  const { approvalUser } = useApprovalUser();
  const [loadingApproval, setLoadingApproval] = useState(false);

  function approvalUserClick(props: { token: string; action: ApprovalEnum }) {
    setLoadingApproval(true);
    approvalUser({
      token: props.token,
      action: props.action,
    })
      .then((value) => {
        console.log('value', value);
        window.location.href = value?.url ?? '/';
      })
      .finally(() => {
        setLoadingApproval(false);
      });
  }

  if (isLoading || loadingApproval) {
    return <Loader></Loader>;
  }

  // Redirect to home page if the user is already approved
  if (data?.status !== UserStatusEnum.PENDING) {
    window.location.href = '/';
    return null;
  }

  if (error) {
    return (
      <div className="my-14">
        <div className="py-14 mx-auto bg-white text-center max-w-[1000px]">
          <div className="text-center text-red-500">Error: User not found</div>
        </div>
      </div>
    );
  }

  return (
    <div className="my-14">
      <div className="py-14 mx-auto bg-white text-center max-w-[1000px]">
        <div className="mb-4  text-xl font-semibold ">
          A new registration request has arrived
        </div>
        <div className=" text-base font-normal mb-8">
          There is a new registration request with the following information:
        </div>
        <div className="flex flex-col items-center gap-3  self-stretch rounded border border-gray-100 bg-white">
          <div className="pt-5 pb-9">
            <UserApprovalPageInfoField
              label="First name"
              value={data?.first_name}
            />
            <UserApprovalPageInfoField
              label="Last name"
              value={data?.last_name}
            />
            <UserApprovalPageInfoField
              label="Profession"
              value={data?.profession}
            />
            <UserApprovalPageInfoField
              label="Institution"
              value={data?.institution}
            />
            <UserApprovalPageInfoField label="Email" value={data?.email} />
            <UserApprovalPageInfoField
              className="flex flex-col"
              label="Explanation of his/her planned use of the UNIC data"
              value={data?.explanation}
            />
          </div>
        </div>
        <div className="pt-8">
          <div className="mb-5">
            <span className="text-sm font-bold text-gray-900 ">
              Do you accept the registration request?
            </span>
          </div>
          <div className="flex mx-auto gap-3 justify-center">
            <Button
              type="primary"
              size="regular"
              className="w-52	"
              onClick={() =>
                approvalUserClick({
                  token: props.token,
                  action: ApprovalEnum.accept,
                })
              }
            >
              Yes
            </Button>
            <Button
              type="secondary"
              size="regular"
              className="w-52	"
              onClick={() =>
                approvalUserClick({
                  token: props.token,
                  action: ApprovalEnum.reject,
                })
              }
            >
              No
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function UserApprovalPageInfoField(props: {
  label: string;
  value?: string | null;
  className?: string;
}) {
  return (
    <div className={`mb-3 ${props.className || ''}`}>
      <span className=" text-base font-semibold pr-2">{props.label}:</span>
      <span className="text-base font-normal max-w-[400px]">
        {props.value ?? ''}
      </span>
    </div>
  );
}
