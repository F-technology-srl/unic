import 'reflect-metadata';
import {
  Button,
  RadioButton,
  RadioButtonFormInput,
  SelectFormInput,
  XIcon,
  Slider,
  Loader,
} from '@unic/core-ui';
import { classValidatorResolver } from '@hookform/resolvers/class-validator';
import { CorporaFilterSearchDto } from '@unic/shared/corpora-dto';
import { FormProvider, useForm } from 'react-hook-form';
import { useGetCorporaFilters } from '../data-access';
import { useState } from 'react';

const resolver = classValidatorResolver(CorporaFilterSearchDto);
export interface SearchSidebarProps {
  onSubmit: (values: CorporaFilterSearchDto) => void;
  onChangeAvailableOnUnic: (value: boolean) => void;
}

export const SearchSidebarForm = (props: SearchSidebarProps) => {
  const formMethods = useForm<CorporaFilterSearchDto>({
    resolver,
    defaultValues: {
      alignment_status: null,
      annotation_status: null,
      anonymization: null,
      availability: null,
      transcription_status: null,
      data_available: true,
      max_duration: '00:00:00',
    },
  });

  const [availableOnUnic, setAvailableOnUnic] = useState(true);

  const {
    data: filters,
    mutate,
    isLoading,
  } = useGetCorporaFilters(availableOnUnic);

  const longestDurationInSeconds = filters?.duration.map((time) => {
    const splitted = time.value.split(':');
    const seconds: number =
      parseInt(splitted[0]) * 3600 +
      parseInt(splitted[1]) * 60 +
      parseInt(splitted[2]);
    return seconds;
  });

  const longestDuration =
    longestDurationInSeconds?.reduce(
      (max, current) => Math.max(max, current),
      0,
    ) ?? 0;

  return (
    <div className="flex flex-col gap-5 min-w-[306px] md:max-w-[306px] w-full bg-white py-5 pl-7 pr-3.5">
      {isLoading && <Loader />}
      <FormProvider {...formMethods}>
        <form
          onSubmit={formMethods.handleSubmit(props.onSubmit)}
          className="flex flex-col gap-10"
        >
          <div>
            <h3 className="text-xl text-black leading-5 font-semibold">
              Filters
            </h3>
          </div>
          <div className="flex flex-col gap-2.5">
            <span className="leading-normal text-sm font-medium">
              Corpus data available on UNIC
            </span>
            <div>
              <RadioButton
                name="data_available"
                values={[
                  { value: 'true', label: 'Yes' },
                  { value: 'false', label: 'No' },
                ]}
                inline
                selected={String(availableOnUnic)}
                onChange={(e) => {
                  // formMethods.reset();
                  const availableBool =
                    e.target.value === 'true' ? true : false;
                  setAvailableOnUnic(availableBool);
                  formMethods.setValue('data_available', availableBool);
                  props.onChangeAvailableOnUnic(availableBool);
                  mutate();
                }}
              />
            </div>
          </div>
          <div className="overflow-hidden h-[580px] w-full relative left-[-3px]">
            <div className="flex flex-col gap-5 overflow-y-scroll max-h-[calc(100vh-4rem)] w-full h-full pr-3.5 scrollbar-transparent pl-[3px]">
              {filters?.corpora_name && (
                <SelectFormInput
                  isMulti
                  label="Corpus name"
                  options={filters.corpora_name.map((item) => ({
                    value: item.value,
                    label:
                      item.label.length > 40
                        ? `${item.label.slice(0, 40)}...`
                        : item.label,
                  }))}
                  name="corpus_name"
                />
              )}

              {availableOnUnic === false && (
                <>
                  {filters?.creator && filters?.creator.length > 0 && (
                    <SelectFormInput
                      isMulti
                      label="Creator"
                      options={filters?.creator || []}
                      name="creator"
                    />
                  )}
                  {filters?.availability &&
                    filters?.availability.length > 0 && (
                      <RadioButtonFormInput
                        name="availability"
                        values={filters?.availability || []}
                        label="Availability"
                      />
                    )}
                  {filters?.publication_year &&
                    filters?.publication_year.length > 0 && (
                      <SelectFormInput
                        isMulti
                        label="Publication year"
                        options={filters?.publication_year || []}
                        name="publication_year"
                      />
                    )}
                </>
              )}

              {filters?.source_language &&
                filters?.source_language.length > 0 && (
                  <SelectFormInput
                    isMulti
                    label="Source language"
                    options={filters?.source_language || []}
                    name="source_language"
                  />
                )}
              {filters?.target_language &&
                filters?.target_language.length > 0 && (
                  <SelectFormInput
                    isMulti
                    label="Target language"
                    options={filters?.target_language || []}
                    name="target_language"
                  />
                )}
              {availableOnUnic === true ? (
                <>
                  {filters?.setting && filters?.setting.length > 0 && (
                    <SelectFormInput
                      isMulti
                      hideSearchBox
                      label="Setting"
                      options={filters?.setting || []}
                      name="setting"
                    />
                  )}
                  {filters?.topic_domain &&
                    filters?.topic_domain.length > 0 && (
                      <SelectFormInput
                        isMulti
                        label="Topic domain"
                        options={filters?.topic_domain || []}
                        name="topic_domain"
                      />
                    )}
                  {filters?.working_mode &&
                    filters?.working_mode.length > 0 && (
                      <SelectFormInput
                        isMulti
                        hideSearchBox
                        label="Working mode"
                        options={filters?.working_mode || []}
                        name="working_mode"
                      />
                    )}
                  {filters?.setting_specific &&
                    filters?.setting_specific.length > 0 && (
                      <SelectFormInput
                        label="Setting specific"
                        options={filters?.setting_specific || []}
                        name="setting_specific"
                      />
                    )}
                  {filters?.interpreter_status &&
                    filters?.interpreter_status.length > 0 && (
                      <SelectFormInput
                        label="Interpreter status"
                        options={filters?.interpreter_status || []}
                        name="interpreter_status"
                      />
                    )}
                  {filters?.event_year && filters?.event_year.length > 0 && (
                    <SelectFormInput
                      label="Event year"
                      options={filters?.event_year || []}
                      name="event_year"
                    />
                  )}

                  <SelectFormInput
                    isMulti
                    label="Data modality"
                    options={filters?.data_modality || []}
                    name="data_modality"
                  />

                  <RadioButtonFormInput
                    name="source_language_mother_tongue"
                    values={[
                      {
                        value: 'true',
                        label: 'Yes',
                      },
                      {
                        value: 'false',
                        label: 'No',
                      },
                    ]}
                    label="Source language mother tongue"
                  />
                  <Slider
                    name="max_duration"
                    label="Source duration"
                    min={0}
                    max={longestDuration}
                  />
                  {filters?.annotation_type &&
                    filters?.annotation_type.length > 0 && (
                      <SelectFormInput
                        isMulti
                        label="Annotation type"
                        options={filters?.annotation_type || []}
                        name="annotation_type"
                      />
                    )}
                  {filters?.annotation_mode &&
                    filters?.annotation_mode.length > 0 && (
                      <RadioButtonFormInput
                        name="annotation_mode"
                        values={filters?.annotation_mode || []}
                        label="Annotation mode"
                      />
                    )}
                </>
              ) : (
                <>
                  {filters?.setting && filters?.setting.length > 0 && (
                    <SelectFormInput
                      isMulti
                      hideSearchBox
                      label="Setting"
                      options={filters?.setting || []}
                      name="setting"
                    />
                  )}
                  {filters?.topic_domain &&
                    filters?.topic_domain.length > 0 && (
                      <SelectFormInput
                        isMulti
                        label="Topic domain"
                        options={filters?.topic_domain || []}
                        name="topic_domain"
                      />
                    )}
                  {filters?.working_mode &&
                    filters?.working_mode.length > 0 && (
                      <SelectFormInput
                        isMulti
                        hideSearchBox
                        label="Working mode"
                        options={filters?.working_mode || []}
                        name="working_mode"
                      />
                    )}
                  <Slider
                    name="max_duration"
                    label="Duration"
                    min={0}
                    max={longestDuration}
                  />
                  {filters?.anonymization &&
                    filters?.anonymization.length > 0 && (
                      <RadioButtonFormInput
                        name="anonymization"
                        values={filters?.anonymization || []}
                        label="Anonymisation flag"
                      />
                    )}
                  {filters?.transcription_status &&
                    filters?.transcription_status.length > 0 && (
                      <RadioButtonFormInput
                        name="transcription_status"
                        values={filters?.transcription_status || []}
                        label="Transcription status"
                      />
                    )}
                  {filters?.annotation_status &&
                    filters?.annotation_status.length > 0 && (
                      <RadioButtonFormInput
                        name="annotation_status"
                        values={filters?.annotation_status || []}
                        label="Annotation status"
                      />
                    )}
                  {filters?.alignment_status &&
                    filters?.alignment_status.length > 0 && (
                      <RadioButtonFormInput
                        name="alignment_status"
                        values={filters?.alignment_status || []}
                        label="Alignment status"
                        selected=""
                      />
                    )}
                </>
              )}
            </div>
          </div>
          <div className="flex flex-row gap-3 w-full pt-5 border-t border-gray-100">
            <Button
              isSubmit
              className="w-full"
              size="xs"
              type="outlined-primary"
            >
              Apply
            </Button>

            <Button
              isSubmit
              className="w-full"
              size="xs"
              icon={[
                {
                  icon: <XIcon className="w-2.5 h-2.5 text-gray-800" />,
                  position: 'right',
                },
              ]}
              type="outlined-secondary"
              onClick={() => {
                formMethods.reset();
              }}
            >
              Clear
            </Button>
          </div>
        </form>
      </FormProvider>
    </div>
  );
};
