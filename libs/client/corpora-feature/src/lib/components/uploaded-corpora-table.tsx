import { useGetCorporaRegistered } from '@unic/client-user-feature';
import {
  ModifyIcon,
  Button,
  Loader,
  Table,
  TableBody,
  TableHeader,
  TableRow,
} from '@unic/core-ui';
import { CorporaMetadataStatusEnum } from '@unic/shared/database-dto';

export const UploadedCorporaTable = () => {
  const { data, isLoading } = useGetCorporaRegistered();

  if (isLoading) {
    return <Loader></Loader>;
  }

  return data && data.length > 0 ? (
    <>
      <p className="text-base font-normal pb-5">
        Check out your corpus on UNIC:
      </p>
      <Table>
        <TableHeader>
          <span>CORPUS</span>
          <span>CONSULTATIONS</span>
          <span>DOWNLOADS</span>
          <span>APPROVAL</span>
          <span>SHARE</span>
          <span></span>
        </TableHeader>
        <TableBody>
          {data.map((item, index) => {
            return (
              <TableRow key={`row-${item.corpora_uuid}-${index}`}>
                <a
                  className="uppercase text-sm font-medium text-blue-800 hover:underline"
                  href={`readme/${item.acronym}`}
                >
                  {item.acronym}
                </a>
                <span>{item.number_of_visit}</span>
                <span>{item.number_of_downloads}</span>
                <span>{item.status_label}</span>
                <span>{item.upload_data_at ? 'uploaded' : '-'}</span>
                <span className="flex justify-end">
                  <Button
                    type="primary"
                    size="round-no-border"
                    icon={[{ icon: <ModifyIcon />, position: 'right' }]}
                    onClick={() =>
                      (window.location.href = `corpora-metadata/${item.acronym}/modify-your-corpus`)
                    }
                  ></Button>
                </span>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </>
  ) : (
    <div className="text-base font-normal mb-5">
      There are no corpora registered.
    </div>
  );
};
