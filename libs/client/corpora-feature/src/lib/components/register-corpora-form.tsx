import 'reflect-metadata';
import { FormProvider, useForm } from 'react-hook-form';
import { Button, TitleInput } from '@unic/core-ui';
import { CreateCorporaMetadataDataDto } from '@unic/shared/corpora-dto';
import { RegisterCorporaLine } from './register-corpora-line';
import {
  CorporaMetadataAvailabilityEnum,
  CorporaMetadataFileTypeEnum,
  CorporaMetadataTranscriptionStatusEnum,
  CorporaMetadataAnnotationStatusEnum,
  LanguageId,
  CorporaMetadataAlignmentStatusEnum,
  CorporaMetadataStatusEnum,
  SettingEnum,
  WorkingModeEnum,
} from '@unic/shared/database-dto';
import { classValidatorResolver } from '@hookform/resolvers/class-validator';
import { useApproveCorporaMetadata, useGetValidAcronym } from '../data-access';
import { useEffect, useState } from 'react';
import { InputTextFormInput } from '@unic/core-ui';
import { FileInput } from '@unic/core-ui';
import { CorporaMetadataStructureJsonValidate } from '@unic/shared/corpora-dto';
import { plainToInstance } from 'class-transformer';
import { validate, ValidationError } from 'class-validator';

const resolver = classValidatorResolver(CreateCorporaMetadataDataDto);

export interface RegisterCorporaFormProps {
  defaultValues?: CreateCorporaMetadataDataDto;
  onSubmit: (
    values: CreateCorporaMetadataDataDto,
  ) => unknown | Promise<unknown>;
  isNew: boolean;
  statusMode?: boolean;
  errors?: string;
  acronym?: string;
  token?: string;
}

export const RegisterCorporaForm = (props: RegisterCorporaFormProps) => {
  const formMethods = useForm<CreateCorporaMetadataDataDto>({
    resolver,
    defaultValues: props.defaultValues,
  });
  const [acronymError, setAcronymError] = useState<boolean>(false);

  const newAcronym = formMethods.watch('acronym');
  const { data: isValideAcronym } = useGetValidAcronym(newAcronym);
  const [genericError, setGenericError] = useState<string | null | undefined>(
    props.errors,
  );

  useEffect(() => {
    if (isValideAcronym?.isPresent !== undefined) {
      setAcronymError(isValideAcronym?.isPresent);
    }
  }, [isValideAcronym]);

  const [fileToUpload, setFileToUpload] = useState<
    CorporaMetadataStructureJsonValidate | null | undefined
  >(
    props.defaultValues?.metadata_structure_json
      ? props.defaultValues?.metadata_structure_json
      : null,
  );
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  //update metadata_structure_json_text when fileToUpload changes
  useEffect(() => {
    if (fileToUpload || fileToUpload === null) {
      console.log('fileToUpload', fileToUpload);
      const corporaValidate: CorporaMetadataStructureJsonValidate = JSON.parse(
        JSON.stringify(fileToUpload),
      ) as CorporaMetadataStructureJsonValidate;
      formMethods.setValue('metadata_structure_json', corporaValidate);
    }
  }, [fileToUpload, formMethods]);

  const availability = formMethods.watch('availability');
  const anonymizationStatus = formMethods.watch('anonymization');
  const transcriptionStatus = formMethods.watch('transcription_status');
  const annotationStatus = formMethods.watch('annotation_status');
  const alignmentStatus = formMethods.watch('alignment_status');
  const { approveCorporaMetadata } = useApproveCorporaMetadata();

  function printValidationErrors(
    errors: ValidationError[],
    parentPath = '',
  ): string[] {
    let errorsString: string[] = [];
    for (const error of errors) {
      const propertyPath = parentPath
        ? `${parentPath}.${error.property}`
        : error.property;
      if (error.constraints) {
        for (const [constraint, message] of Object.entries(error.constraints)) {
          console.log(`${propertyPath} - ${message} - ${constraint}`);
          errorsString.push(` ${message} `);
        }
      }
      if (error.children && error.children.length > 0) {
        errorsString = errorsString.concat(
          printValidationErrors(error.children, propertyPath),
        );
      }
    }
    return errorsString;
  }

  if (!props.token && props.statusMode) {
    return;
  }

  return (
    <div className="flex flex-col gap-4">
      <FormProvider {...formMethods}>
        <form
          onSubmit={formMethods.handleSubmit(props.onSubmit)}
          className="flex flex-col gap-10"
        >
          <div className="flex flex-col gap-8">
            <RegisterCorporaLine
              type="textarea"
              labelTitle="Name"
              linkTitle={{
                url: 'https://vocabularies.clarin.eu/clavas/ccr/en/page/?uri=http%3A%2F%2Fhdl.handle.net%2F11459%2FCCR_C-2544_3626545e-a21d-058c-ebfd-241c0464e7e5',
                target: '_blank',
              }}
              labelInput="Full name of the corpus"
              nameInput="name"
              placeholderInput={`${props.statusMode ? '' : 'e.g. Telephone Interpreting German–Arabic, Telefondolmetschen Arabisch–Deutsch.'}`}
              infoTextInput="You can provide multiple values here."
              required
              disabled={props.statusMode}
              rows={2}
            />
            <RegisterCorporaLine
              type="acronym"
              labelTitle="Acronym"
              linkTitle={{
                url: 'https://vocabularies.clarin.eu/clavas/ccr/en/page/?uri=http%3A%2F%2Fhdl.handle.net%2F11459%2FCCR_C-334_e99db400-a55c-1747-e876-f2a0099a42e7',
                target: '_blank',
              }}
              labelInput="Corpus acronym"
              nameInput="acronym"
              placeholderInput={`${props.statusMode ? '' : 'e.g. TIGA'}`}
              infoTextInput={
                <span>
                  If you will share your corpus data on UNIC, an acronym must be
                  provided because we will use it to identify your corpus in our
                  database.<br></br>You can provide only one value here.
                </span>
              }
              required
              disabled={!props.isNew || props.statusMode}
              helperText={
                acronymError
                  ? props.statusMode || !props.isNew
                    ? ''
                    : 'This acroynm has already been taken. Please provide another acronym.'
                  : ''
              }
            />

            <RegisterCorporaLine
              type="textarea"
              labelTitle="Version"
              linkTitle={{
                url: 'http://hdl.handle.net/11459/CCR_C-2547_7883d382-b3ce-8ab4-7052-0138525a8ba1',
                target: '_blank',
              }}
              labelInput="Version of the corpus"
              nameInput="version"
              placeholderInput={`${props.statusMode ? '' : 'e.g. 1.0, where the first digit is a major corpus update, e.g. adding new data or annotations, and the second digit is a minor update, e.g. corrections of transcripts; add a third digit for changes in documentation where data are unchanged'}`}
              infoTextInput=""
              rows={6}
              disabled={props.statusMode}
            />
            <RegisterCorporaLine
              type="text"
              labelTitle="Persistent identifier"
              linkTitle={{
                url: 'http://hdl.handle.net/11459/CCR_C-2573_ae7c2548-8a86-ab6e-7099-e28b7697d1a2',
                target: '_blank',
              }}
              labelInput={
                <div className="inline">
                  A persistent identifier (typically a{' '}
                  <a
                    href="https://www.handle.net/"
                    target="_blank"
                    className="text-blue-800 hover:underline"
                    rel="noreferrer"
                  >
                    handle
                  </a>{' '}
                  or a{' '}
                  <a
                    href="https://www.doi.org/"
                    className="text-blue-800 hover:underline"
                    target="_blank"
                    rel="noreferrer"
                  >
                    DOI
                  </a>
                  ) of the corpus
                </div>
              }
              nameInput="persistent_identifier"
              placeholderInput={`${props.statusMode ? '' : 'e.g. http://hdl.handle.net/11321/821'}`}
              infoTextInput=""
              disabled={props.statusMode}
            />
            <RegisterCorporaLine
              type="textarea"
              labelTitle="Cite as"
              linkTitle={{
                url: 'https://www.dublincore.org/specifications/dublin-core/dcmi-terms/#bibliographicCitation',
                target: '_blank',
              }}
              labelInput="Citation of the corpus dataset"
              nameInput="citation"
              placeholderInput={`${props.statusMode ? '' : 'Author, A. (Year). Title of the corpus dataset (Version number) [Dataset]. Publisher name. Persistent identifier.'}`}
              infoTextInput=""
              required
              rows={6}
              disabled={props.statusMode}
            />
            <RegisterCorporaLine
              type="textarea"
              labelTitle="Reference article"
              linkTitle={{
                url: 'https://vocabularies.clarin.eu/clavas/ccr/en/page/?uri=http%3A%2F%2Fhdl.handle.net%2F11459%2FCCR_C-3937_b00b282f-0fb7-6ddd-f03f-45212f8df321',
                target: '_blank',
              }}
              labelInput="The reference article(s) that you would like others to use to refer to the interpreting corpus, typically containing an extensive description of the corpus and its design"
              nameInput="article_reference"
              placeholderInput={`${props.statusMode ? '' : 'e.g. Russo, M., Bendazzoli, C., Sandrelli, A. & Spinolo, N. (2012). The European Parliament Interpreting Corpus (EPIC): Implementation and developments. In F. Straniero Sergio & C. Falbo (Eds.), Breaking ground in corpus-based interpreting studies. Bern; New York: Peter Lang, 53–90.'}`}
              rows={6}
              disabled={props.statusMode}
            />
            <RegisterCorporaLine
              type="textarea"
              labelTitle="Description"
              linkTitle={{
                url: 'https://vocabularies.clarin.eu/clavas/ccr/en/page/?uri=http%3A%2F%2Fhdl.handle.net%2F11459%2FCCR_C-6139_ab15a7eb-7032-d4f0-643e-bffe5ad09fc3',
                target: '_blank',
              }}
              labelInput="A 200–2000-characters description of the corpus"
              nameInput="description"
              placeholderInput={`${props.statusMode ? '' : 'Write a short description'}`}
              required
              rows={6}
              disabled={props.statusMode}
            />
            <RegisterCorporaLine
              type="multi"
              labelTitle="Creator(s)"
              linkTitle={{
                url: 'https://vocabularies.clarin.eu/clavas/ccr/en/page/?uri=http%3A%2F%2Fhdl.handle.net%2F11459%2FCCR_C-6130_f11d590d-b9f3-6a81-9f17-22988671e59e',
                target: '_blank',
              }}
              labelInput="Names of the people responsible for creating the corpus"
              nameInput="creator"
              placeholderInput={`${props.statusMode ? '' : 'e.g. Russo Mariachiara, Smith John'}`}
              infoTextInput={
                <span>
                  You can provide multiple values here in the format of{' '}
                  <i>surname given name</i>; use the comma to separate the names
                  of different creators.
                </span>
              }
              required
              disabled={props.statusMode}
            />
            <RegisterCorporaLine
              type="multi"
              labelTitle="Contact information"
              linkTitle={{
                url: 'https://catalog.clarin.eu/ds/ComponentRegistry/#/?itemId=clarin.eu%3Acr1%3Ac_1430905751602&registrySpace=public',
                target: '_blank',
              }}
              labelInput="Contact information of the creators, such as the email or mail address, that has long-lasting accessibility"
              nameInput="contact_information"
              placeholderInput={`${props.statusMode ? '' : 'e.g. mariachiara.russo@unibo.it'}`}
              infoTextInput="You can provide multiple values here; use the comma as a separator."
              disabled={props.statusMode}
            />
            <RegisterCorporaLine
              type="multi"
              labelTitle="Contributor(s)"
              linkTitle={{
                url: 'https://vocabularies.clarin.eu/clavas/ccr/en/page/?uri=http%3A%2F%2Fhdl.handle.net%2F11459%2FCCR_C-6833_9440b43b-e77d-f98b-fddb-cab61f18f0ed',
                target: '_blank',
              }}
              labelInput="Names of the people involved in the corpus creation"
              nameInput="contributors"
              placeholderInput={`${props.statusMode ? '' : 'e.g. Lobascio Marco (transcriber), Smith John (technician)'}`}
              infoTextInput={
                <span>
                  You can provide multiple values here in the format of{' '}
                  <i>surname given name (contribution)</i>; use the comma to
                  separate the names and contributions of different
                  contributors.
                </span>
              }
              disabled={props.statusMode}
            />
            <RegisterCorporaLine
              type="textarea"
              labelTitle="Funding information"
              linkTitle={{
                url: 'https://catalog.clarin.eu/ds/ComponentRegistry/#/?itemId=clarin.eu%3Acr1%3Ac_1391763610430&registrySpace=public',
                target: '_blank',
              }}
              labelInput="Information on the project that has funded the creation of this corpus, such as the name of the funding body, and project name, number, and webpage"
              nameInput="funding_information"
              placeholderInput={`${props.statusMode ? '' : 'e.g. EPIC v2.0 is partially funded by the European Union’s Horizon 2020 research and innovation programme under the Marie Skłodowska-Curie grant agreement No. 101108651. https://cordis.europa.eu/project/id/101108651'}`}
              disabled={props.statusMode}
            />
            <RegisterCorporaLine
              type="select"
              labelTitle="Availability"
              linkTitle={{
                url: 'https://vocabularies.clarin.eu/clavas/ccr/en/page/?uri=http%3A%2F%2Fhdl.handle.net%2F11459%2FCCR_C-2453_1f0c3ea5-7966-ae11-d3c6-448424d4e6e8',
                target: '_blank',
              }}
              labelInput="Is the corpus open to all, restricted to specific uses or closed?"
              nameInput="availability"
              options={Object.values(CorporaMetadataAvailabilityEnum).map(
                (value) => ({ value, label: value }),
              )}
              required
              disabled={props.statusMode}
            />
            {(availability === CorporaMetadataAvailabilityEnum.open ||
              availability === CorporaMetadataAvailabilityEnum.restricted) && (
              <RegisterCorporaLine
                type="text"
                labelTitle="Licence"
                linkTitle={{
                  url: 'https://vocabularies.clarin.eu/clavas/ccr/en/page/?uri=http%3A%2F%2Fhdl.handle.net%2F11459%2FCCR_C-5362_8cffd964-f57e-09ed-daed-eeabbf2d22c0',
                  target: '_blank',
                }}
                labelInput="Name the licence"
                nameInput="license"
                placeholderInput={`${props.statusMode ? '' : 'e.g. Creative Commons - Attribution 4.0 International (CC BY 4.0)'}`}
                infoTextInput="You can only provide one value here. The licence must be named if you will share your corpus data on UNIC."
                disabled={props.statusMode}
              />
            )}
            {(availability === CorporaMetadataAvailabilityEnum.open ||
              availability === CorporaMetadataAvailabilityEnum.restricted) && (
              <RegisterCorporaLine
                type="text"
                labelTitle="Licence url"
                linkTitle={{
                  url: 'https://vocabularies.clarin.eu/clavas/ccr/en/page/?uri=http%3A%2F%2Fhdl.handle.net%2F11459%2FCCR_C-6586_2c79d86a-5a75-0890-d407-7d9cb86b9beb',
                  target: '_blank',
                }}
                labelInput="Provide a URL to the full licence text"
                nameInput="license_url"
                placeholderInput={`${props.statusMode ? '' : 'e.g. https://creativecommons.org/licenses/by/4.0/'}`}
                infoTextInput="You can only provide one value here. The licence URL must be provided if you will share your corpus data on UNIC."
                disabled={props.statusMode}
              />
            )}
            <RegisterCorporaLine
              type="text"
              labelTitle="Publication date"
              linkTitle={{
                url: 'https://vocabularies.clarin.eu/clavas/ccr/en/page/?uri=http%3A%2F%2Fhdl.handle.net%2F11459%2FCCR_C-2538_8b697452-7ef3-9fce-ccf9-a7f344f11317',
                target: '_blank',
              }}
              labelInput="Release date of the current version"
              nameInput="publication_date"
              placeholderInput={`${props.statusMode ? '' : 'YYYY-MM-DD'}`}
              infoTextInput=""
              required
              disabled={props.statusMode}
            />
            <RegisterCorporaLine
              type="multi"
              labelTitle="Other version"
              labelInput="Names and links to other versions of the corpus"
              nameInput="names_and_links"
              placeholderInput={`${props.statusMode ? '' : 'e.g. 1.2 http://doi.org/10.25592/uhhfdm.8308'}`}
              infoTextInput="You can provide multiple values here; use the comma as a separator."
              disabled={props.statusMode}
            />
            <RegisterCorporaLine
              type="multi"
              labelTitle="Distribution"
              linkTitle={{
                url: 'http://hdl.handle.net/11459/CCR_C-2967_c96c9be1-3655-28c8-2b1c-0c499309c87a',
                target: '_blank',
              }}
              labelInput="Are the corpus data and/or metadata distributed by platforms other than UNIC, such as data repositories and your institutional webpages? If yes, please provide a link to the corpus landing page."
              nameInput="distribution"
              placeholderInput={`${props.statusMode ? '' : 'https://example.com'}`}
              disabled={props.statusMode}
              infoTextInput="You can provide multiple values here."
            />
            <RegisterCorporaLine
              type="select"
              labelTitle="Source language"
              linkTitle={{
                url: 'https://vocabularies.clarin.eu/clavas/ccr/en/page/?uri=http%3A%2F%2Fhdl.handle.net%2F11459%2FCCR_C-2494_2451c60f-fd9f-6c36-02f6-ac5b8929f487',
                target: '_blank',
              }}
              labelInput="List the source languages"
              nameInput="source_language"
              options={Object.values(LanguageId).map((value) => ({
                value,
                label: value,
              }))}
              isMulti
              infoTextInput={
                <span>
                  Choose one or multiple values from{' '}
                  <a
                    href="https://iso639-3.sil.org/code_tables/639/data/all"
                    target="_blank"
                    className="underline"
                    rel="noreferrer"
                  >
                    ISO 639-3 language code
                  </a>
                  , other.
                </span>
              }
              required
              disabled={props.statusMode}
            />
            <RegisterCorporaLine
              type="select"
              labelTitle="Target language"
              linkTitle={{
                url: 'https://vocabularies.clarin.eu/clavas/ccr/en/page/?uri=http%3A%2F%2Fhdl.handle.net%2F11459%2FCCR_C-2499_52993a80-0bcf-d671-22dc-903effdb98b7',
                target: '_blank',
              }}
              isMulti
              labelInput="List the target languages"
              nameInput="target_language"
              options={Object.values(LanguageId).map((value) => ({
                value,
                label: value,
              }))}
              infoTextInput={
                <span>
                  Choose one or multiple values from{' '}
                  <a
                    href="https://iso639-3.sil.org/code_tables/639/data/all"
                    target="_blank"
                    className="underline"
                    rel="noreferrer"
                  >
                    ISO 639-3 language code
                  </a>
                  , other.
                </span>
              }
              required
              disabled={props.statusMode}
            />
            <RegisterCorporaLine
              type="select"
              labelTitle="Setting"
              labelInput="In what broad social contexts did the interpreting events recorded in the corpus take place?"
              nameInput="setting"
              placeholderInput={`${props.statusMode ? '' : 'e.g. conference'}`}
              isMulti
              options={Object.values(SettingEnum).map((value) => ({
                value,
                label: value,
              }))}
              infoTextInput={<span>You can choose multiple values here.</span>}
              disabled={props.statusMode}
              required
            />
            <RegisterCorporaLine
              type="multi"
              labelTitle="Topic domain"
              labelInput="What broad domains do the events recorded in the corpus fall into?"
              nameInput="topic_domain"
              placeholderInput={`${props.statusMode ? '' : 'e.g. conference'}`}
              isMulti
              infoTextInput={
                <span>
                  You can provide multiple values here using the comma as a
                  separator.
                </span>
              }
              disabled={props.statusMode}
              required
            />
            <RegisterCorporaLine
              type="select"
              labelTitle="Working mode"
              labelInput="List the interpreters’ working mode(s) in the corpus."
              nameInput="working_mode"
              options={Object.values(WorkingModeEnum).map((value) => ({
                value,
                label: value,
              }))}
              placeholderInput={`${props.statusMode ? '' : 'You can choose multiple values here.'}`}
              isMulti
              infoTextInput={<span>You can choose multiple values here.</span>}
              disabled={props.statusMode}
              required
            />
            <RegisterCorporaLine
              type="text"
              labelTitle="Size in disk memory"
              linkTitle={{
                url: 'https://vocabularies.clarin.eu/clavas/ccr/en/page/?uri=http%3A%2F%2Fhdl.handle.net%2F11459%2FCCR_C-2580_6dfe4e09-1c61-9b24-98ad-16bb867860fe',
                target: '_blank',
              }}
              labelInput="Size of the corpus in disk memory in KB, MB, GB, or TB"
              nameInput="size_disk_memory"
              placeholderInput={`${props.statusMode ? '' : 'e.g. 5.08 GB'}`}
              infoTextInput=""
              disabled={props.statusMode}
            />
            <RegisterCorporaLine
              type="number"
              labelTitle="Size in tokens and glosses"
              linkTitle={{
                url: 'https://vocabularies.clarin.eu/clavas/ccr/en/page/?uri=http%3A%2F%2Fhdl.handle.net%2F11459%2FCCR_C-4971_6f331caf-f018-d379-df21-cd5d5e6dd546',
                target: '_blank',
              }}
              labelInput="Number of tokens and glosses for signs in the corpus"
              nameInput="size_tokens"
              placeholderInput=""
              infoTextInput=""
              disabled={props.statusMode}
            />
            <RegisterCorporaLine
              type="number"
              labelTitle="Number of media files"
              linkTitle={{
                url: 'https://vocabularies.clarin.eu/clavas/ccr/en/page/?uri=http%3A%2F%2Fhdl.handle.net%2F11459%2FCCR_C-4517_89929b06-261e-d586-079f-198cdeef86d8',
                target: '_blank',
              }}
              labelInput="Number of media files in the corpus"
              nameInput="number_of_files"
              placeholderInput=""
              infoTextInput=""
              isMulti
              disabled={props.statusMode}
            />
            <RegisterCorporaLine
              type="select"
              labelTitle="Media type"
              linkTitle={{
                url: 'https://vocabularies.clarin.eu/clavas/ccr/en/page/?uri=http%3A%2F%2Fhdl.handle.net%2F11459%2FCCR_C-2570_6f596a6d-4d5c-f336-d971-e61a310e2c8c',
                target: '_blank',
              }}
              labelInput="The file format(s) of the corpus"
              nameInput="media_type"
              options={Object.values(CorporaMetadataFileTypeEnum).map(
                (value) => ({ value, label: value }),
              )}
              infoTextInput=""
              isMulti
              disabled={props.statusMode}
            />
            <RegisterCorporaLine
              type="number"
              labelTitle="Number of interpreters"
              linkTitle={{
                url: 'https://vocabularies.clarin.eu/clavas/ccr/en/page/?uri=http%3A%2F%2Fhdl.handle.net%2F11459%2FCCR_C-6294_fecabf10-ef46-a69c-45c8-2810d24acddd',
                target: '_blank',
              }}
              labelInput="Number of interpreters in the corpus "
              nameInput="number_of_interpreters"
              placeholderInput=""
              infoTextInput=""
              disabled={props.statusMode}
            />
            <RegisterCorporaLine
              type="text"
              labelTitle="Duration"
              linkTitle={{
                url: 'https://vocabularies.clarin.eu/clavas/ccr/en/page/?uri=http%3A%2F%2Fhdl.handle.net%2F11459%2FCCR_C-2690_3d45e6f3-0827-1b1f-b5a5-2ab3b13450fd',
                target: '_blank',
              }}
              labelInput="The duration of all the audio and video recordings in the corpus"
              nameInput="duration"
              placeholderInput={`${props.statusMode ? '' : 'HH:MM:SS'}`}
              infoTextInput=""
              disabled={props.statusMode}
              required
            />
            <RegisterCorporaLine
              type="select"
              labelTitle="Anonymisation flag"
              linkTitle={{
                url: 'https://vocabularies.clarin.eu/clavas/ccr/en/page/?uri=http%3A%2F%2Fhdl.handle.net%2F11459%2FCCR_C-2548_659fd2af-ffa3-f1ee-059d-2c59533b8467',
                target: '_blank',
              }}
              labelInput="Were the transcripts or audiovisual recordings anonymised?"
              nameInput="anonymization"
              options={[
                { value: 'true', label: 'Yes' },
                { value: 'false', label: 'No' },
              ]}
              required
              disabled={props.statusMode}
            />
            {anonymizationStatus === 'true' && (
              <RegisterCorporaLine
                type="textarea"
                labelTitle="Anonymisation documentation"
                linkTitle={{
                  url: 'https://catalog.clarin.eu/ds/ComponentRegistry/#/?itemId=clarin.eu%3Acr1%3Ac_1342181139641&registrySpace=public',
                  target: '_blank',
                }}
                labelInput="Explain how the corpus was anonymised or provide a link to the documentation"
                nameInput="anonymization_description"
                placeholderInput=""
                infoTextInput=""
                rows={6}
                disabled={props.statusMode}
              />
            )}
            <RegisterCorporaLine
              type="select"
              labelTitle="Transcription status"
              linkTitle={{
                url: 'https://vocabularies.clarin.eu/clavas/ccr/en/page/?uri=http%3A%2F%2Fhdl.handle.net%2F11459%2FCCR_C-5506_c43e830b-eb98-9f5b-388d-5a5efb91d14c',
                target: '_blank',
              }}
              labelInput="Were the language samples in the corpus fully, partially or not transcribed?"
              nameInput="transcription_status"
              options={Object.values(
                CorporaMetadataTranscriptionStatusEnum,
              ).map((value) => ({
                value,
                label: value.charAt(0).toUpperCase() + value.slice(1),
              }))}
              required
              disabled={props.statusMode}
            />
            {(transcriptionStatus ===
              CorporaMetadataTranscriptionStatusEnum.partially ||
              transcriptionStatus ===
                CorporaMetadataTranscriptionStatusEnum.fully) && (
              <RegisterCorporaLine
                type="text"
                labelTitle="Transcription documentation"
                linkTitle={{
                  url: 'https://catalog.clarin.eu/ds/ComponentRegistry/#/?itemId=clarin.eu%3Acr1%3Ac_1342181139641&registrySpace=public',
                  target: '_blank',
                }}
                labelInput="Provide a link to the corpus documentation, manual, or a reference article explaining the transcription convention of the corpus"
                nameInput="transcription_description"
                placeholderInput="e.g. http://hdl.handle.next/11321/821"
                infoTextInput=""
                disabled={props.statusMode}
              />
            )}
            <RegisterCorporaLine
              type="select"
              labelTitle="Annotation status"
              linkTitle={{
                url: 'https://vocabularies.clarin.eu/clavas/ccr/en/page/?uri=http%3A%2F%2Fhdl.handle.net%2F11459%2FCCR_C-4009_a0bff262-8ee6-4ec8-4d74-657b10411a72',
                target: '_blank',
              }}
              labelInput="Was the corpus fully, partially or not annotated, such as with part-of-speech tags, error types and rendition types?"
              nameInput="annotation_status"
              options={Object.values(CorporaMetadataAnnotationStatusEnum).map(
                (value) => ({
                  value,
                  label: value.charAt(0).toUpperCase() + value.slice(1),
                }),
              )}
              required
              disabled={props.statusMode}
            />
            {(annotationStatus ===
              CorporaMetadataAnnotationStatusEnum.partially ||
              annotationStatus ===
                CorporaMetadataAnnotationStatusEnum.fully) && (
              <RegisterCorporaLine
                type="textarea"
                labelTitle="Annotation documentation"
                linkTitle={{
                  url: 'https://catalog.clarin.eu/ds/ComponentRegistry/#/?itemId=clarin.eu%3Acr1%3Ac_1459844210471&registrySpace=public',
                  target: '_blank',
                }}
                labelInput="Provide a short description of the annotation or links to the documentation and the manual"
                nameInput="annotation_status_description"
                placeholderInput=""
                infoTextInput=""
                rows={6}
                disabled={props.statusMode}
              />
            )}
            <RegisterCorporaLine
              type="select"
              labelTitle="Alignment status"
              linkTitle={{
                url: 'https://vocabularies.clarin.eu/clavas/ccr/en/page/?uri=http%3A%2F%2Fhdl.handle.net%2F11459%2FCCR_C-3988_7dae537c-75bd-bbc0-2604-e0d22332f184',
                target: '_blank',
              }}
              labelInput="Was the corpus fully, partially or not aligned?"
              nameInput="alignment_status"
              options={Object.values(CorporaMetadataAlignmentStatusEnum).map(
                (value) => ({
                  value,
                  label: value.charAt(0).toUpperCase() + value.slice(1),
                }),
              )}
              required
              disabled={props.statusMode}
            />
            {(alignmentStatus ===
              CorporaMetadataAlignmentStatusEnum.partially ||
              alignmentStatus === CorporaMetadataAlignmentStatusEnum.fully) && (
              <RegisterCorporaLine
                type="textarea"
                labelTitle="Alignment documentation"
                labelInput="Provide a short description of the alignment or links to the documentation and the manual"
                nameInput="aligment_status_description"
                placeholderInput=""
                infoTextInput=""
                rows={6}
                disabled={props.statusMode}
              />
            )}
            <div className="grid md:grid-cols-[auto_480px] lg:grid-cols-[auto_580px] items-center gap-8">
              <TitleInput
                label="Upload file examples"
                link={{
                  url: ' https://zenodo.org/records/13383112',
                  target: '_blank',
                }}
              />
              <FileInput
                name="metadata_structure_json_text"
                label={
                  <span>
                    {' '}
                    Would you like to share the specific metadata of your corpus
                    based on the{' '}
                    <a
                      href="https://tinyurl.com/intpmetadata"
                      className="text-blue-800 hover:underline"
                      target="_blank"
                      rel="noreferrer"
                    >
                      metadata schema of interpreting corpora
                    </a>{' '}
                    ? Upload a{' '}
                    <a
                      className="text-blue-800 hover:underline"
                      href="https://doi.org/10.5281/zenodo.13773785"
                      target="_blank"
                      rel="noreferrer"
                    >
                      JSON file
                    </a>{' '}
                    , or use this{' '}
                    <a
                      className="text-blue-800 hover:underline"
                      href="https://doi.org/10.5281/zenodo.13773785"
                      target="_blank"
                      rel="noreferrer"
                    >
                      Excel spreadsheet
                    </a>{' '}
                    as the template and{' '}
                    <a
                      className="text-blue-800 hover:underline"
                      href="https://huggingface.co/spaces/nannanliu/UNIC_metadata_conversion"
                      target="_blank"
                      rel="noreferrer"
                    >
                      convert it to JSON
                    </a>
                    .
                  </span>
                }
                fileCostraints={{
                  accept: 'application/json',
                  label: 'JSON',
                }}
                belowContent={
                  <span className="text-sm font-medium text-gray-900 leading-5">
                    The file has been uploaded correctly
                  </span>
                }
                errors={uploadError}
                onDelete={() => setFileToUpload(null)}
                acceptJson
                onChange={async (files) => {
                  if (files && files.length > 0) {
                    try {
                      setUploading(true);
                      const file = files[0];
                      const text = await file.text();
                      console.log('asdasd', text);
                      const json = JSON.parse(text);
                      const dtoda = plainToInstance(
                        CorporaMetadataStructureJsonValidate,
                        json,
                      );

                      const errors = await validate(dtoda as object);

                      if (errors.length === 0) {
                        setUploading(false);
                        setFileToUpload(json);
                        setUploadError(null);
                      } else {
                        setUploading(false);
                        setFileToUpload(null);
                        setUploadError(printValidationErrors(errors).join(' '));
                        errors.forEach((error) => {
                          console.log(error.property); // Nome della proprietà
                          console.log(error.constraints); // Errori di validazione
                        });
                      }
                    } catch (error) {
                      console.error('Error uploading file:', error);
                      setUploading(false);
                      setUploadError('Not valid Json file');
                      setFileToUpload(null);
                    }
                  }
                }}
                disabled={props.statusMode}
                loading={uploading}
                infoText="Be careful: if you don’t provide a metadata file here, you will not be able to share your corpus data later."
                uploadedJson={fileToUpload}
                nameFileDownload={props.defaultValues?.acronym}
              />
            </div>
            <InputTextFormInput
              label=""
              name="metadata_structure_json"
              type="hidden"
            />
          </div>
          {!props.statusMode ? (
            <div className="flex flex-row items-center justify-center">
              <Button
                isSubmit
                type="primary"
                size="regular"
                className="max-w-[88px]"
                disabled={!props.isNew ? false : acronymError}
              >
                Submit
              </Button>
            </div>
          ) : (
            props.acronym &&
            props.token && (
              <div className="flex flex-row items-center justify-center gap-4">
                <Button
                  type="primary"
                  size="regular"
                  onClick={() =>
                    approveCorporaMetadata({
                      acronym: props.acronym ?? '',
                      status: CorporaMetadataStatusEnum.current,
                      token: props.token ?? '',
                    })
                      .then(() => {
                        window.location.href = '/';
                      })
                      .catch((error) => {
                        setGenericError(error.message);
                      })
                  }
                >
                  Approve Registration
                </Button>
                <Button
                  type="outlined-secondary"
                  size="regular"
                  onClick={() =>
                    approveCorporaMetadata({
                      acronym: props.acronym ?? '',
                      status: CorporaMetadataStatusEnum.rejected,
                      token: props.token ?? '',
                    })
                      .then(() => {
                        window.location.href = '/';
                      })
                      .catch((error) => {
                        setGenericError(error.message);
                      })
                  }
                >
                  Refuse
                </Button>
              </div>
            )
          )}
          {genericError && <div className="text-red-500">{genericError}</div>}
        </form>
      </FormProvider>
    </div>
  );
};
