import {
  CorporaMetadataAlignmentStatusEnum,
  CorporaMetadataAnnotationStatusEnum,
  CorporaMetadataAnonymizationEnum,
  CorporaMetadataAvailabilityEnum,
  CorporaMetadataStatusEnum,
  CorporaMetadataTranscriptionStatusEnum,
} from '@unic/shared/database-dto';
import { RegisterCorporaForm } from '../components/register-corpora-form';
import {
  useCreateCorporaMetadata,
  useGetCorporaMetadata,
  useGetCorporaMetadataAlreadyPresent,
} from '../data-access';
import { Button, Loader, Modal, ModalHandle, ModalSubmit } from '@unic/core-ui';
import { useEffect, useRef, useState } from 'react';
import { CreateCorporaMetadataDataDto } from '@unic/shared/corpora-dto';

export const UpdateCorporaPage = (props: { acronym: string }) => {
  const { data, isLoading } = useGetCorporaMetadata(
    props.acronym,
    CorporaMetadataStatusEnum.current,
    true,
  );

  const { data: found, mutate } = useGetCorporaMetadataAlreadyPresent(
    props.acronym,
  );

  const [isOpen, setIsOpen] = useState(found?.found);
  const [values, setValues] = useState<CreateCorporaMetadataDataDto>();

  useEffect(() => {
    setIsOpen(found?.found);
  }, [found]);

  const submitRef = useRef<ModalHandle>(null);
  const { createCorporaMetadata } = useCreateCorporaMetadata();
  const submitRefSent = useRef<ModalHandle>(null);
  function onSubmitForm() {
    // scroll to top
    window.scrollTo(0, 0);
    submitRef.current?.toggleState();
  }
  function onSubmitSentForm() {
    // scroll to top
    window.scrollTo(0, 0);
    submitRefSent.current?.toggleState();
    mutate();
  }

  if (isLoading) {
    return <Loader />;
  }

  return (
    <div className="">
      {isOpen === true && (
        <div>
          <div
            id="persistent-modal"
            className=" inset-0 flex items-center justify-center"
          >
            <div
              className="bg-white flex flex-col gap-4 p-8 rounded-md w-fit max-w-[535px] text-center text-gray-900"
              // onClick prevents closing when clicking inside the modal
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-xl font-semibold">Pending request</h2>
              <p className="text-base">
                Your request is pending, and you will receive a response in 2-3
                working days.
              </p>
            </div>
          </div>
        </div>
      )}
      {!isOpen && (
        <RegisterCorporaForm
          onSubmit={(values) => {
            onSubmitForm();
            setValues(values);
          }}
          defaultValues={{
            ...data,
            acronym: props.acronym.toUpperCase(),
            corpora_uuid: data?.corpora_uuid || '',
            name: data?.name ?? '',
            citation: data?.citation ?? '',
            description: data?.description ?? '',
            creator: data?.creator ?? [],
            availability:
              data?.availability ?? CorporaMetadataAvailabilityEnum.open,
            publication_date: data?.publication_date ?? '',
            source_language: data?.source_language ?? [],
            target_language: data?.target_language ?? [],
            anonymization:
              data?.anonymization ?? CorporaMetadataAnonymizationEnum.false,
            transcription_status:
              data?.transcription_status ??
              CorporaMetadataTranscriptionStatusEnum.no,
            annotation_status:
              data?.annotation_status ?? CorporaMetadataAnnotationStatusEnum.no,
            alignment_status:
              data?.alignment_status ?? CorporaMetadataAlignmentStatusEnum.no,
            setting: data?.setting ?? [],
            topic_domain: data?.topic_domain ?? [],
            working_mode: data?.working_mode ?? [],
            distribution: data?.distribution ?? [],
          }}
          isNew={false}
          acronym={props.acronym}
        />
      )}

      <Modal
        ref={submitRef}
        id="submit-form-modal"
        disableOutsideClick={true}
        triggerElement={<span></span>}
        className="max-w-[570px]"
      >
        <div className="flex flex-col justify-center items-center">
          <span className="text-gray-900 text-xl leading-5 font-semibold pb-4 text-center">
            Modify corpus metadata
          </span>
          <span className="text-base text-gray-900 pb-6 text-center">
            Are you sure you want to modify and submit again your corpus
            metadata?
            <br />
            If you shared your data before, you will have to do it again after
            approval.
          </span>
          <div className="flex justify-between w-full gap-[10px]">
            <Button
              size="regular"
              type="primary"
              onClick={() => {
                if (values) {
                  createCorporaMetadata(values)
                    .then(() => {
                      console.log('Corpora updated');
                      submitRef.current?.toggleState();
                      onSubmitSentForm();
                    })
                    .catch((error) => {
                      console.log('Error updating corpora', error);
                    });
                }
              }}
              className="bg-primary text-white px-4 py-2 rounded-md w-full"
            >
              Proceed
            </Button>
            <Button
              size="regular"
              type="outlined-secondary"
              onClick={() => {
                submitRef.current?.toggleState();
              }}
              className="bg-gray-200 text-gray-900 px-4 py-2 rounded-md w-full"
            >
              Cancel
            </Button>
          </div>
        </div>
      </Modal>
      <ModalSubmit
        submitRef={submitRefSent}
        text={
          <>
            <span className="text-gray-900 text-xl leading-5 font-semibold pt-6">
              Your corpus metadata have been submitted
            </span>
            <span className="text-base text-gray-600 pt-4">
              You will receive an email with the result in 2-3 working days.
            </span>
          </>
        }
      />
    </div>
  );
};

export default UpdateCorporaPage;
