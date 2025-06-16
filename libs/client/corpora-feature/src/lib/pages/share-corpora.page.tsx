import { Button, Loader, ModalHandle, ModalSubmit } from '@unic/core-ui';
import { useRef, useState } from 'react';
import { CorporaShareDataDto } from '@unic/shared/corpora-dto';
import { useGetCorporaConShareData, useShareCorporaData } from '../data-access';
import { ShareCorporaForm } from '../components';

export const ShareCorporaPage = () => {
  const {
    data: listOfMetadata,
    isLoading: isLoadingMetadata,
    mutate,
  } = useGetCorporaConShareData();
  const { shareCorporaData, error: errorUploading } = useShareCorporaData();
  const [uploadDone, setUploadDone] = useState(false);
  const [valueSend, setValueSend] = useState<CorporaShareDataDto>();

  const uploadDoneModalRef = useRef<ModalHandle>(null);
  const uploadErrorModalRef = useRef<ModalHandle>(null);
  const uploadLoadingModalRef = useRef<ModalHandle>(null);

  const onSubmitForm = (values: CorporaShareDataDto) => {
    setValueSend(values);
    uploadLoadingModalRef.current?.toggleState();
    shareCorporaData(values)
      .then(() => {
        uploadDoneModalRef.current?.toggleState();
        setUploadDone(true);
        mutate();
      })
      .catch(() => {
        console.log('errorUploading', errorUploading);
        uploadErrorModalRef.current?.toggleState();
      })
      .finally(() => {
        uploadLoadingModalRef.current?.closeState();
      });
  };

  if (isLoadingMetadata) {
    return <Loader></Loader>;
  }

  return (
    <>
      <div className="mx-auto max-w-[1000px] flex my-5 md:my-14 bg-white p-10  shadow-sm rounded-md border-1 border-slate-50">
        <div className="w-full">
          <h1 className="leading-none text-4xl font-semibold">
            Share your corpus data
          </h1>

          {(listOfMetadata?.length ?? 0) > 0 && (
            <ShareCorporaForm
              listCorporaCanUpload={listOfMetadata ?? []}
              onSubmit={onSubmitForm}
              uploadDone={uploadDone}
            ></ShareCorporaForm>
          )}

          {(listOfMetadata?.length ?? 0) === 0 && (
            <div className="mt-8 p-5 bg-gray-50 ">
              <p className="leading-none text-base font-semibold">
                You have no corpora already approved or associated with your
                account
              </p>
              <p className="text-base font-normal mt-2.5 text-gray-500">
                In order to share your corpus data, you have to register a new
                corpus first and wait for approval.
              </p>
              <div className="mt-5 max-w-56">
                <Button
                  type="primary"
                  size="regular"
                  href="/corpora-metadata/register-your-corpus"
                >
                  Register your corpus
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      <ModalSubmit
        submitRef={uploadDoneModalRef}
        onClose={() => {
          setUploadDone(false);
        }}
        text={
          <>
            <span className="text-gray-900 leading-none text-xl font-semibold mt-8 mb-5">
              Done!
            </span>
            <span className="text-base font-normaltext-gray-700 mb-5 text-center">
              Your corpus data have been uploaded correctly. You will be able to
              search your corpus along with other interpreting corpora. We will
              contact you in case of problems.
            </span>
            <span className="text-gray-900 text-sm font-bold">
              Thank you for supporting open science.
            </span>
          </>
        }
      />

      <ModalSubmit
        submitRef={uploadErrorModalRef}
        type="error"
        text={
          <>
            <span className="text-gray-900 text-xl leading-3 font-semibold my-8">
              Something went wrong
            </span>

            <Button
              type="primary"
              size="regular"
              onClick={() => {
                valueSend && onSubmitForm(valueSend);
              }}
              className="w-full"
            >
              Retry
            </Button>
          </>
        }
      />
      <ModalSubmit
        submitRef={uploadLoadingModalRef}
        type="loading"
        disableClose
      />
    </>
  );
};

export default ShareCorporaPage;
