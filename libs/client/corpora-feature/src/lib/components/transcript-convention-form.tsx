import { InputText } from '@unic/core-ui';
import { UserConventionType } from '@unic/shared/corpora-dto';
import { useEffect, useState } from 'react';

type TranscriptConventionItemField = {
  name: string;
  disabled?: boolean;
  placeholder?: string;
  onChange?: React.ChangeEventHandler<HTMLInputElement>;
  value?: string;
};

interface TranscriptConventionFormProps {
  onChange: (conventions: UserConventionType) => void;
}

export const TranscriptConventionForm = (
  props: TranscriptConventionFormProps,
) => {
  const [conventions, setConventions] = useState<UserConventionType>({});

  useEffect(() => {
    props.onChange(conventions);
  }, [conventions, props]);

  return (
    <div className="flex flex-col gap-4 mb-8">
      <div className="grid grid-cols-2 px-4 py-1">
        <div className="grid-col ">
          <label className="text-xs font-semibold text-gray-500">FEATURE</label>
        </div>

        <div className="grid-col ">
          <label className="text-xs font-semibold text-gray-500">
            YOUR SYMBOL
          </label>
        </div>
      </div>
      <div className="bg-white rounded">
        <TranscriptConventionFormItem
          label="End of a sentence"
          field_1={{
            name: 'end_of_sentence_token',
            placeholder: '//',
            onChange: (e) =>
              setConventions({
                ...conventions,
                end_of_sentence_token: e.target.value,
              }),
          }}
        ></TranscriptConventionFormItem>
        <TranscriptConventionFormItem
          label="Question"
          field_1={{
            name: 'question_token',
            placeholder: '?',
            onChange: (e) =>
              setConventions({
                ...conventions,
                question_token: e.target.value,
              }),
          }}
        ></TranscriptConventionFormItem>
        <TranscriptConventionFormItem
          label="Speaker ID"
          field_1={{
            name: 'speaker_talking_token',
            placeholder: ':',
            onChange: (e) =>
              setConventions({
                ...conventions,
                speaker_talking_token: e.target.value,
              }),
          }}
        ></TranscriptConventionFormItem>
        <TranscriptConventionFormItem
          label="Overlap"
          field_1={{
            name: 'overlap_start_token',
            placeholder: '[',
            onChange: (e) =>
              setConventions({
                ...conventions,
                overlap_start_token: e.target.value,
              }),
          }}
          field_2={{
            name: 'overlap_middle',
            value: 'thank',
            disabled: true,
          }}
          field_3={{
            name: 'overlap_end_token',
            placeholder: ']',
            onChange: (e) =>
              setConventions({
                ...conventions,
                overlap_end_token: e.target.value,
              }),
          }}
        ></TranscriptConventionFormItem>
        <TranscriptConventionFormItem
          label="0.2 s < silent pause ≤ 0.5 s"
          field_1={{
            name: 'short_pause_token',
            placeholder: '(.)',
            onChange: (e) =>
              setConventions({
                ...conventions,
                short_pause_token: e.target.value,
              }),
          }}
        ></TranscriptConventionFormItem>

        <TranscriptConventionFormItem
          label="0.5 s < silent pause ≤ 1 s"
          field_1={{
            name: 'medium_pause_token',
            placeholder: '(..)',
            onChange: (e) =>
              setConventions({
                ...conventions,
                medium_pause_token: e.target.value,
              }),
          }}
        ></TranscriptConventionFormItem>

        <TranscriptConventionFormItem
          label="Silent pause > 1 s"
          field_1={{
            name: 'long_pause_token_start',
            placeholder: '(',
            onChange: (e) =>
              setConventions({
                ...conventions,
                long_pause_token_start: e.target.value,
              }),
          }}
          field_2={{
            name: 'long_pause_middle',
            placeholder: '2.5',
            disabled: true,
          }}
          field_3={{
            name: 'long_pause_token_end',
            placeholder: ')',
            onChange: (e) =>
              setConventions({
                ...conventions,
                long_pause_token_end: e.target.value,
              }),
          }}
        ></TranscriptConventionFormItem>

        <TranscriptConventionFormItem
          label="Ligature and latching"
          field_1={{
            name: 'ligature_and_latching_token',
            placeholder: '(0)',
            onChange: (e) =>
              setConventions({
                ...conventions,
                ligature_and_latching_token: e.target.value,
              }),
          }}
        ></TranscriptConventionFormItem>

        <TranscriptConventionFormItem
          label="Filled pause"
          field_1={{
            name: 'filled_pause_token',
            placeholder: '-eh-',
            onChange: (e) =>
              setConventions({
                ...conventions,
                filled_pause_token: e.target.value,
              }),
          }}
        ></TranscriptConventionFormItem>

        <TranscriptConventionFormItem
          label="Unintelligibility"
          field_1={{
            name: 'unintelligibility_start_token',
            placeholder: '((x',
            onChange: (e) =>
              setConventions({
                ...conventions,
                unintelligibility_start_token: e.target.value,
              }),
          }}
          field_2={{
            name: 'unintelligibility_middle',
            placeholder: '3 s cough/laugh',
            disabled: true,
          }}
          field_3={{
            name: 'unintelligibility_end_token',
            placeholder: '))',
            onChange: (e) =>
              setConventions({
                ...conventions,
                unintelligibility_end_token: e.target.value,
              }),
          }}
        ></TranscriptConventionFormItem>

        <TranscriptConventionFormItem
          label="Uncertainty"
          field_1={{
            name: 'uncertainty_start_token',
            placeholder: '((?',
            onChange: (e) =>
              setConventions({
                ...conventions,
                uncertainty_start_token: e.target.value,
              }),
          }}
          field_2={{
            name: 'uncertainty_middle',
            placeholder: 'angry',
            disabled: true,
          }}
          field_3={{
            name: 'uncertainty_end_token',
            placeholder: '))',
            onChange: (e) =>
              setConventions({
                ...conventions,
                uncertainty_end_token: e.target.value,
              }),
          }}
        ></TranscriptConventionFormItem>

        <TranscriptConventionFormItem
          label="Vocal noise"
          field_1={{
            name: 'vocal_noise_start_token',
            placeholder: '<',
            onChange: (e) =>
              setConventions({
                ...conventions,
                vocal_noise_start_token: e.target.value,
              }),
          }}
          field_2={{
            name: 'vocal_noise_middle',
            placeholder: 'cough/laugh',
            disabled: true,
          }}
          field_3={{
            name: 'vocal_noise_end_token',
            placeholder: '>',
            onChange: (e) =>
              setConventions({
                ...conventions,
                vocal_noise_end_token: e.target.value,
              }),
          }}
        ></TranscriptConventionFormItem>

        <TranscriptConventionFormItem
          label="Incorrect pronunciation"
          field_1={{
            name: 'misspronunciation_word_token',
            placeholder: '~',
            onChange: (e) =>
              setConventions({
                ...conventions,
                misspronunciation_word_token: e.target.value,
              }),
          }}
        ></TranscriptConventionFormItem>

        <TranscriptConventionFormItem
          label="Correct form of mispronunciation"
          field_1={{
            name: 'misspronunciation_corret_form_start_token',
            placeholder: '/',
            onChange: (e) =>
              setConventions({
                ...conventions,
                misspronunciation_corret_form_start_token: e.target.value,
              }),
          }}
          field_2={{
            name: 'misspronunciation_corret_form_end_token',
            placeholder: '/',
            onChange: (e) =>
              setConventions({
                ...conventions,
                misspronunciation_corret_form_end_token: e.target.value,
              }),
          }}
        ></TranscriptConventionFormItem>

        <TranscriptConventionFormItem
          label="Truncated word"
          field_1={{
            name: 'truncated_word_token',
            placeholder: '= and space',
            onChange: (e) =>
              setConventions({
                ...conventions,
                truncated_word_token: e.target.value,
              }),
          }}
        ></TranscriptConventionFormItem>

        <TranscriptConventionFormItem
          label="False start"
          field_1={{
            name: 'false_start_token',
            placeholder: '=',
            onChange: (e) =>
              setConventions({
                ...conventions,
                false_start_token: e.target.value,
              }),
          }}
        ></TranscriptConventionFormItem>

        <TranscriptConventionFormItem
          label="Syllable lengthening"
          field_1={{
            name: 'syllable_lengthening_token',
            placeholder: ':',
            onChange: (e) =>
              setConventions({
                ...conventions,
                syllable_lengthening_token: e.target.value,
              }),
          }}
        ></TranscriptConventionFormItem>
      </div>
    </div>
  );
};

interface TranscriptConventionFormItemProps {
  label: string;
  field_1: TranscriptConventionItemField;
  field_2?: TranscriptConventionItemField;
  field_3?: TranscriptConventionItemField;
}
export const TranscriptConventionFormItem = (
  props: TranscriptConventionFormItemProps,
) => {
  return (
    <div className="grid grid-cols-2 p-4">
      <div className="grid-col py-2">
        <label className="text-sm font-normal">{props.label}</label>
      </div>

      <div className="grid-col flex gap-2 w-full ">
        <InputText
          name={props.field_1.name}
          placeholder={props.field_1.placeholder}
          disabled={props.field_1.disabled}
          onChange={props.field_1.onChange}
          value={props.field_1.value}
          className="w-full"
        ></InputText>
        {props.field_2 && (
          <InputText
            name={props.field_2.name}
            placeholder={props.field_2.placeholder}
            disabled={props.field_2.disabled}
            onChange={props.field_2.onChange}
            value={props.field_2.value}
            className="w-full"
          ></InputText>
        )}
        {props.field_3 && (
          <InputText
            name={props.field_3.name}
            placeholder={props.field_3.placeholder}
            disabled={props.field_3.disabled}
            onChange={props.field_3.onChange}
            value={props.field_3.value}
            className="w-full"
          ></InputText>
        )}
      </div>
    </div>
  );
};
