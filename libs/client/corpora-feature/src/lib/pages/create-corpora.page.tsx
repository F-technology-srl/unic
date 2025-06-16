import { useRef, useState } from 'react';
import { RegisterCorporaForm } from '../components/register-corpora-form';
import { ModalHandle, ModalSubmit } from '@unic/core-ui';
import { CreateCorporaMetadataDataDto } from '@unic/shared/corpora-dto';
import { useCreateCorporaMetadata } from '../data-access';

export const CreateCorporaPage = () => {
  const { createCorporaMetadata } = useCreateCorporaMetadata();
  const submitRef = useRef<ModalHandle>(null);
  const [errors, setErrors] = useState<string>('');
  const [defaultValues, setDefaultValues] = useState<
    CreateCorporaMetadataDataDto | undefined
  >(undefined);

  function onSubmitForm() {
    // scroll to top
    window.scrollTo(0, 0);
    submitRef.current?.toggleState();
  }

  function onCloseModalInsert() {
    // close modal
    console.log('Modal closed');
    window.location.href = '/corpora-metadata/register-your-corpus';
  }

  return (
    <div className="">
      <RegisterCorporaForm
        onSubmit={(values) => {
          createCorporaMetadata(values)
            .then(() => {
              // open success modal
              console.log('Corpora created');
              onSubmitForm();
            })
            .catch((error) => {
              setErrors(error.message);
              console.log('Error creating corpora', error);
            });
        }}
        isNew={true}
        errors={errors}
        defaultValues={defaultValues}
      />

      <ModalSubmit
        submitRef={submitRef}
        onClose={onCloseModalInsert}
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

export default CreateCorporaPage;
