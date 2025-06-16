import { FormProvider, useForm } from 'react-hook-form';
import { Button, FileInput, RadioButton, Select, Stepper } from '@unic/core-ui';
import React, { useEffect, useState } from 'react';
import { TranscriptConventionForm } from './transcript-convention-form';
import { useRepositoryAssetZip } from '@unic/client-global-data-access';
import { ZipCategory } from '@unic/shared/global-types';
import {
  CorporaInfoCanUploadDto,
  CorporaShareDataDto,
  UserConventionType,
  ZipAssets,
} from '@unic/shared/corpora-dto';
import { classValidatorResolver } from '@hookform/resolvers/class-validator';

export interface ShareCorporaFormProps {
  defaultValues?: CorporaShareDataDto;
  onSubmit: (values: CorporaShareDataDto) => void;
  listCorporaCanUpload: CorporaInfoCanUploadDto[];
  uploadDone?: boolean;
}

const resolver = classValidatorResolver(CorporaShareDataDto);

export const ShareCorporaForm = (props: ShareCorporaFormProps) => {
  const formMethods = useForm<CorporaShareDataDto>({
    resolver,
    defaultValues: props.defaultValues,
  });

  const corporaUUID = formMethods.watch('corpora_uuid');
  const zipAssets = formMethods.watch('zipAssets');

  useEffect(() => {
    if (props.uploadDone) {
      formMethods.reset();
    }
  }, [props.uploadDone, formMethods]);

  function atLeastOneKeyHasValue(obj: ZipAssets): boolean {
    return Object.values(obj).some(
      (value) => value !== null && value !== undefined && value !== '',
    );
  }

  return (
    <div className="flex flex-col gap-4 mt-8">
      <FormProvider {...formMethods}>
        <form
          onSubmit={formMethods.handleSubmit(props.onSubmit)}
          className="flex flex-col gap-4"
        >
          <StepperSelectCorpus
            listCorporaCanUpload={props.listCorporaCanUpload}
            onSelected={(corpus_uuid) => {
              formMethods.setValue('corpora_uuid', corpus_uuid);
            }}
          ></StepperSelectCorpus>
          {corporaUUID && (
            <>
              <StepperTranscriptConvention
                onChange={(userConventionRule) => {
                  formMethods.setValue(
                    'userConventionRule',
                    userConventionRule,
                  );
                }}
              ></StepperTranscriptConvention>
              <StepperUploadZipCorpus
                stepper_number={3}
                stepper_label="Upload transcripts"
                fileInput={{
                  name: 'file-input-transcripts',
                  label: StepperUploadZipCorpusHeaderText({
                    first_row:
                      'Upload all source and target transcripts in one ZIP file',
                    second_row:
                      'Individual transcripts should be in TXT format. All files must be included in a single zip.',
                  }),
                }}
                maxGBFileSize={3}
                onUploadComplete={(repository_asset_uuid) => {
                  formMethods.setValue(
                    'zipAssets.transcriptsZipAssetUuid',
                    repository_asset_uuid,
                  );
                }}
                tipology_upload={ZipCategory.transcription}
              ></StepperUploadZipCorpus>
              <StepperUploadZipCorpus
                stepper_number={4}
                stepper_label="Upload alignments"
                fileInput={{
                  name: 'file-input-transcripts',
                  label: StepperUploadZipCorpusHeaderText({
                    first_row: 'Upload all alignments in a ZIP file',
                    second_row: (
                      <span>
                        Please use{' '}
                        <a
                          className="text-blue-800 hover:underline"
                          href="https://doi.org/10.5281/zenodo.13773802"
                          target="_blank"
                          rel="noreferrer"
                        >
                          this spreadsheet
                        </a>{' '}
                        to format your alignment files and{' '}
                        <a
                          className="text-blue-800 hover:underline"
                          href="https://huggingface.co/spaces/nannanliu/UNIC_alignment_conversion"
                          target="_blank"
                          rel="noreferrer"
                        >
                          convert them
                        </a>{' '}
                        to a ZIP of{' '}
                        <a
                          className="text-blue-800 hover:underline"
                          href="https://doi.org/10.5281/zenodo.13773802"
                          target="_blank"
                          rel="noreferrer"
                        >
                          JSON files here
                        </a>
                        .
                      </span>
                    ),
                  }),
                }}
                maxGBFileSize={3}
                onUploadComplete={(repository_asset_uuid) => {
                  formMethods.setValue(
                    'zipAssets.alignmentsZipAssetUuid',
                    repository_asset_uuid,
                  );
                }}
                tipology_upload={ZipCategory.alignment}
              ></StepperUploadZipCorpus>
              <StepperUploadZipCorpus
                stepper_number={5}
                stepper_label="Upload annotations"
                fileInput={{
                  name: 'file-input-transcripts',
                  label: StepperUploadZipCorpusHeaderText({
                    first_row: 'Upload all annotations in a ZIP file',
                    second_row:
                      'Individual annotations can be in TXT, XML, EAF, TEXTGRID, EXB, JSON, GZ, CHA, HTML, TMX, XLSX, CSV, and TSV formats. All files must be included in a single zip.',
                  }),
                }}
                maxGBFileSize={3}
                onUploadComplete={(repository_asset_uuid) => {
                  formMethods.setValue(
                    'zipAssets.annotationsZipAssetUuid',
                    repository_asset_uuid,
                  );
                }}
                tipology_upload={ZipCategory.annotation}
              ></StepperUploadZipCorpus>
              <StepperUploadZipCorpus
                stepper_number={6}
                stepper_label="Upload audio recordings"
                fileInput={{
                  name: 'file-input-transcripts',
                  label: StepperUploadZipCorpusHeaderText({
                    first_row: 'Upload all audio recordings in a ZIP file',
                    second_row:
                      'Individual audio recordings can be in MP3, WAV, or OGG formats to maximize compatibility across browsers. All files must be included in a single zip.',
                  }),
                }}
                maxGBFileSize={10}
                onUploadComplete={(repository_asset_uuid) => {
                  formMethods.setValue(
                    'zipAssets.audiosZipAssetUuid',
                    repository_asset_uuid,
                  );
                }}
                tipology_upload={ZipCategory.audio}
              ></StepperUploadZipCorpus>
              <StepperUploadZipCorpus
                stepper_number={7}
                stepper_label="Upload video recordings"
                fileInput={{
                  name: 'file-input-transcripts',
                  label: StepperUploadZipCorpusHeaderText({
                    first_row: 'Upload all video recordings in a ZIP file',
                    second_row:
                      'Individual video recordings can be in MP4 format using the H.264 codec to maximize compatibility across browsers. All files must be included in a single zip.',
                  }),
                }}
                maxGBFileSize={20}
                onUploadComplete={(repository_asset_uuid) => {
                  formMethods.setValue(
                    'zipAssets.videosZipAssetUuid',
                    repository_asset_uuid,
                  );
                }}
                tipology_upload={ZipCategory.video}
              ></StepperUploadZipCorpus>
              <StepperUploadZipCorpus
                stepper_number={8}
                stepper_label="Upload associated files"
                fileInput={{
                  name: 'file-input-transcripts',
                  label: StepperUploadZipCorpusHeaderText({
                    first_row:
                      'Upload a single zip including all associated files',
                    second_row:
                      "Associated files of your corpus, e.g. interpreters' notes, preparation materials, can be uploaded here. Individual files can be in PDF, TXT, TSV, or CSV formats. All files must be included in a single zip.",
                  }),
                }}
                maxGBFileSize={3}
                onUploadComplete={(repository_asset_uuid) => {
                  formMethods.setValue(
                    'zipAssets.documentsZipAssetUuid',
                    repository_asset_uuid,
                  );
                }}
                tipology_upload={ZipCategory.associeted_file}
              ></StepperUploadZipCorpus>
              <div className="flow-root">
                <span></span>
                <div className="float-right">
                  <Button
                    isSubmit
                    type="primary"
                    size="regular"
                    disabled={!atLeastOneKeyHasValue(zipAssets ?? {})}
                  >
                    Confirm
                  </Button>
                </div>
              </div>
            </>
          )}
        </form>
      </FormProvider>
    </div>
  );
};

export const StepperSelectCorpus = (props: {
  listCorporaCanUpload: CorporaInfoCanUploadDto[];
  onSelected: (corpus_uuid: string) => void;
}) => {
  const [selectedCorpus, setSelectedCorpus] = useState<string | undefined>();

  return (
    <div className="flex flex-col gap-4 mb-8">
      <Stepper number={1} label="Select corpus*" state="active"></Stepper>
      <Select
        name="metadata_corpora_uuid"
        onSelected={(value) => {
          setSelectedCorpus(value?.toString());
          props.onSelected(value?.toString() ?? '');
        }}
        selected={selectedCorpus}
        options={props.listCorporaCanUpload.map((corpus) => {
          return {
            label: corpus.name ?? 'No Data',
            value: corpus.corpora_uuid,
          };
        })}
      ></Select>
      <span className="text-base font-normal text-gray-500">
        Is the metadata information about your corpus up to date? Click{' '}
        <a href="/use" className="text-blue-800 hover:underline">
          here
        </a>{' '}
        to modify it.
      </span>
    </div>
  );
};

interface StepperTranscriptConventionProps {
  onChange: (conventions: UserConventionType) => void;
}

export const StepperTranscriptConvention = (
  props: StepperTranscriptConventionProps,
) => {
  const [showTranscriptConversion, setShowTranscriptConversion] =
    useState(true);

  return (
    <div className="flex flex-col gap-4 mb-8">
      <Stepper
        number={2}
        label="Convert your transcript convention"
        state="active"
      ></Stepper>
      <div className="p-7 bg-gray-50">
        <p className="text-base font-normal mb-8">
          Providing your symbols in the transcription convention is optional,
          but they help us to deliver a unified, cross-corpus search experience
          for users.
        </p>
        <span className="leading-none text-base font-semibold">
          Transcript conversion
        </span>
        <div className="my-5">
          <RadioButton
            name="transcript_convention_active"
            selected={String(showTranscriptConversion)}
            values={[
              { label: 'Yes', value: 'true' },
              { label: 'No', value: 'false' },
            ]}
            onChange={(e) => {
              setShowTranscriptConversion(e.target.value === 'true');
            }}
            inline
          ></RadioButton>
        </div>
        {showTranscriptConversion && (
          <div>
            <TranscriptConventionForm
              onChange={props.onChange}
            ></TranscriptConventionForm>
          </div>
        )}
      </div>
    </div>
  );
};

interface StepperUploadZipCorpusProps {
  stepper_number: number;
  stepper_label: string;
  fileInput: {
    name: string;
    label: React.ReactNode;
  };
  maxGBFileSize: number;
  onUploadComplete?: (repository_asset_uuid: string) => void;
  tipology_upload: ZipCategory;
}

export const StepperUploadZipCorpus = (props: StepperUploadZipCorpusProps) => {
  const [uploading, setUploading] = useState(false);
  const [currentRepositoryAssetToBeAdded, setCurrentRepositoryAsset] = useState<
    string | undefined
  >();
  const { uploadFile, repositoryAsset } = useRepositoryAssetZip(
    currentRepositoryAssetToBeAdded,
  );

  const [errorUploading, setErrorUploading] = useState<string | null>(null);
  const [progress, setProgress] = useState<number | null>(null);

  return (
    <div className="flex flex-col gap-4 mb-8">
      <Stepper
        number={props.stepper_number}
        label={props.stepper_label}
        state="active"
      ></Stepper>
      <div className="p-7 bg-gray-50">
        <FileInput
          name={props.fileInput.name}
          label={props.fileInput.label}
          fileCostraints={{
            accept: 'application/zip',
            label: 'ZIP',
          }}
          belowContent={
            <span className="text-sm font-medium text-gray-900 leading-5">
              The file has been uploaded correctly
            </span>
          }
          onChange={async (files) => {
            if (files && files.length > 0) {
              setUploading(true);
              setErrorUploading(null);
              setProgress(null);
              uploadFile({
                file: files[0],
                scope: props.tipology_upload,
                category: props.tipology_upload,
                onProgress: (progress) => {
                  console.log('progress', progress);
                  setProgress(progress);
                },
              })
                .then((responseUpload) => {
                  console.log('res', responseUpload);
                  if (responseUpload?.repository_asset_uuid) {
                    props.onUploadComplete?.(
                      responseUpload?.repository_asset_uuid,
                    );
                    setCurrentRepositoryAsset(
                      responseUpload?.repository_asset_uuid,
                    );
                  }
                })
                .catch((error) => {
                  console.error('Error uploading file:', error);
                  setErrorUploading(error);
                })
                .finally(() => {
                  setUploading(false);
                });
            }
          }}
          currentAsset={currentRepositoryAssetToBeAdded}
          uploadedAssetNames={
            repositoryAsset?.user_file_name
              ? [repositoryAsset?.user_file_name]
              : undefined
          }
          loading={uploading}
          errors={errorUploading}
          progress={progress}
          onFileToLarge={() => {
            setErrorUploading('File too large');
          }}
          maxGBFileSize={props.maxGBFileSize}
        />
      </div>
    </div>
  );
};

export const StepperUploadZipCorpusHeaderText = (props: {
  first_row: string | React.ReactNode;
  second_row: string | React.ReactNode;
}) => {
  return (
    <>
      <p className="leading-none text-base font-semibold text-gray-900 mb-4">
        <span>{props.first_row}</span>
      </p>
      <p className="text-base font-normal text-gray-500">
        <span>{props.second_row}</span>
      </p>
    </>
  );
};
