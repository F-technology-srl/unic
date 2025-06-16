import { Button, Checkbox, Loader, Modal, ModalHandle } from '@unic/core-ui';
import { TranscriptToDownload } from '@unic/shared/corpora-dto';
import { DownloadDataTypeEnum } from '@unic/shared/database-dto';
import { useEffect, useState } from 'react';
import { useDowloadCorporaData, useLicenseCorpora } from '../data-access';

export interface DownloadModalProps {
  onClose?: () => void;
  onDownload?: () => void;
  transcripts: TranscriptToDownload[];
  submitRef?: React.RefObject<ModalHandle>;
}

export const DownloadModal = (props: DownloadModalProps) => {
  const [typeOfDownload, setTypeOfDownload] = useState<DownloadDataTypeEnum[]>(
    [],
  );
  const [acceptedLicence, setAcceptedLicence] = useState<boolean>(false);

  const [generateDownload, setGenerateDownload] = useState<boolean>(false);
  const [errorGenerateDownload, setErrorGenerateDownload] = useState<string>();

  const [pageDisplay, setPageDisplay] = useState<number>(1);
  const [downalodUrl, setDownloadUrl] = useState<string>('');

  const { downloadCorporaData } = useDowloadCorporaData();

  const { data: licencesCorpora } = useLicenseCorpora({
    corpora_uuid: props.transcripts.map((t) => t.corpora_uuid),
  });

  function handleClickDownloadItem(type: DownloadDataTypeEnum) {
    setTypeOfDownload((prevItems) => {
      if (prevItems.includes(type)) {
        return prevItems.filter((i) => i !== type);
      } else {
        return [...prevItems, type];
      }
    });
  }

  useEffect(() => {
    setTypeOfDownload([]);
  }, [props.transcripts]);

  const downloadTypeRequestView = (
    <div className="text-center w-full">
      <p className="leading-none text-xl font-semibold mb-4 text-gray-900">
        Download
      </p>
      <p className="text-sm font-bold mb-4 text-gray-900">
        Select your preferences for download
      </p>
      <div className="mb-5 w-full flex flex-wrap gap-x-6 gap-y-4 mx-auto justify-center items-center">
        <Checkbox
          name="alignments_down_check"
          label="Alignments"
          checked={typeOfDownload.includes(DownloadDataTypeEnum.alignment)}
          onCheckedChange={() =>
            handleClickDownloadItem(DownloadDataTypeEnum.alignment)
          }
        ></Checkbox>
        <Checkbox
          name="annotations_down_check"
          label="Annotation"
          checked={typeOfDownload.includes(DownloadDataTypeEnum.annotation)}
          onCheckedChange={() =>
            handleClickDownloadItem(DownloadDataTypeEnum.annotation)
          }
        ></Checkbox>

        <Checkbox
          name="associated_files_down_check"
          label="Associated files"
          checked={typeOfDownload.includes(
            DownloadDataTypeEnum.associated_files,
          )}
          onCheckedChange={() =>
            handleClickDownloadItem(DownloadDataTypeEnum.associated_files)
          }
        ></Checkbox>
        <Checkbox
          name="media_down_check"
          label="Media"
          checked={typeOfDownload.includes(DownloadDataTypeEnum.media)}
          onCheckedChange={() =>
            handleClickDownloadItem(DownloadDataTypeEnum.media)
          }
        ></Checkbox>
        <Checkbox
          name="transcript_down_check"
          label="Transcripts"
          checked={typeOfDownload.includes(DownloadDataTypeEnum.transcript)}
          onCheckedChange={() =>
            handleClickDownloadItem(DownloadDataTypeEnum.transcript)
          }
        ></Checkbox>
      </div>
      <Button
        type="primary"
        size="regular"
        disabled={typeOfDownload.length === 0}
        onClick={() => {
          setPageDisplay(2);
        }}
        classButton="w-full"
      >
        Continue
      </Button>
    </div>
  );

  const licenceRequestView = (
    <div className="text-center w-full">
      <p className="leading-none text-xl font-semibold mb-4 text-gray-900">
        Licence agreement
      </p>
      <p className="text-sm font-bold mb-4 text-gray-900">
        You must agree to the licence before being able to download
      </p>
      <div className="mb-5 w-full flex flex-wrap gap-x-6 gap-y-4 mx-auto justify-center items-center">
        <Checkbox
          name="license_url"
          label={
            <span>
              I accept the licence agreement of
              {licencesCorpora?.map((licence) => {
                return (
                  <span key={licence.corpora_uuid}>
                    {' '}
                    <a
                      href={
                        licence.license_url ? licence.license_url : undefined
                      }
                      target="_blank"
                      rel="noreferrer"
                      className="underline text-blue-800 uppercase"
                    >
                      {licence.acronyum ?? ''}
                    </a>{' '}
                  </span>
                );
              })}
            </span>
          }
          checked={acceptedLicence}
          onCheckedChange={() => setAcceptedLicence(!acceptedLicence)}
        ></Checkbox>
      </div>
      <Button
        type="primary"
        size="regular"
        disabled={!acceptedLicence}
        classButton="w-full"
        onClick={() => {
          setGenerateDownload(true);
          setErrorGenerateDownload(undefined);
          downloadCorporaData({
            transcripts: props.transcripts,
            with_data: typeOfDownload,
          })
            .then((assetItem) => {
              setDownloadUrl(
                `${window.location.origin}/api/corpora-download-data/${assetItem?.repository_asset_uuid}/zip`,
              );
              setPageDisplay(3);
            })
            .catch((e) => {
              console.error('error', e);
              setErrorGenerateDownload('Error during generating download');
            })
            .finally(() => {
              setGenerateDownload(false);
            });
        }}
      >
        Continue
      </Button>
    </div>
  );

  const downalodRequestView = (
    <div className="text-center w-full">
      <p className="leading-none text-xl font-semibold mb-4 text-gray-900">
        Final step
      </p>
      <p className="text-sm font-bold mb-5 text-gray-900">
        Click here to proceed with the download
      </p>
      <Button
        type="primary"
        size="regular"
        disabled={!acceptedLicence}
        classButton="w-full"
        onClick={() => {
          window.open(downalodUrl, '_blank');
          //closeModal();
          props.onDownload?.();
        }}
      >
        Download
      </Button>
    </div>
  );

  function closeModal() {
    if (pageDisplay === 3) {
      // reset all check
      setTypeOfDownload([]);
    }
    setPageDisplay(1);
    setAcceptedLicence(false);
    props.submitRef?.current?.closeState();
    props.onClose?.();
  }

  const loadingView = <Loader notMiddlePage></Loader>;

  return (
    <Modal
      ref={props.submitRef}
      id="submit-form-modal"
      disableOutsideClick={true}
      triggerElement={<span></span>}
      onClose={() => {
        closeModal();
      }}
    >
      <div
        className={`flex flex-col justify-center items-center max-w-[750px] `}
      >
        {!generateDownload && (
          <>
            {pageDisplay === 1 && downloadTypeRequestView}
            {pageDisplay === 2 && licenceRequestView}
            {pageDisplay === 3 && downalodUrl !== '' && downalodRequestView}
          </>
        )}

        {generateDownload && loadingView}

        {errorGenerateDownload && (
          <span className="text-red-500 mt-4">{errorGenerateDownload}</span>
        )}
      </div>
    </Modal>
  );
};
