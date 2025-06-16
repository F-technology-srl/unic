import {
  CorporaMetadataAlignmentStatusEnum,
  CorporaMetadataAnnotationStatusEnum,
  CorporaMetadataAnonymizationEnum,
  CorporaMetadataAvailabilityEnum,
  CorporaMetadataStatusEnum,
  CorporaMetadataTranscriptionStatusEnum,
} from '@unic/shared/database-dto';
import { RegisterCorporaForm } from '../components/register-corpora-form';
import { Loader } from '@unic/core-ui';
import { useGetCorporaMetadata } from '../data-access';

export const ApproveCorpusRegistrationPage = (props: {
  acronym: string;
  token: string;
}) => {
  const { data, isLoading } = useGetCorporaMetadata(
    props.acronym,
    CorporaMetadataStatusEnum.pending,
  );

  if (isLoading) {
    return <Loader />;
  }

  if (!data || !data.corpora_uuid) {
    return <p>Not Found</p>;
  }

  return (
    <div className="">
      <RegisterCorporaForm
        onSubmit={(values) => {
          console.log('values', values);
        }}
        defaultValues={{
          ...data,
          acronym: props.acronym.toUpperCase(),
          corpora_uuid: data?.corpora_uuid,
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
        statusMode={true}
        token={props.token}
        acronym={props.acronym}
      />
    </div>
  );
};

export default ApproveCorpusRegistrationPage;
