import 'reflect-metadata';
import {
  InputTagsFormInput,
  InputTextFormInput,
  SelectFormInput,
  TextareaFormInput,
  TitleInput,
} from '@unic/core-ui';

export interface RegisterCorporaLineProps {
  type:
    | 'text'
    | 'textarea'
    | 'select'
    | 'number'
    | 'upload'
    | 'multi'
    | 'acronym';
  labelTitle: string;
  linkTitle?: {
    url: string;
    target?: string;
  };
  labelInput: string | JSX.Element;
  nameInput: string;
  placeholderInput?: string;
  infoTextInput?: string | JSX.Element;
  helperText?: string;
  required?: boolean;
  options?: {
    value: string | number | boolean;
    label: string;
  }[];
  disabled?: boolean;
  rows?: number;
  isMulti?: boolean;
}

export const RegisterCorporaLine = (props: RegisterCorporaLineProps) => {
  let html = null;

  switch (props.type) {
    case 'text':
    case 'acronym':
      html = (
        <InputTextFormInput
          label={props.labelInput}
          name={props.nameInput}
          placeholder={props.placeholderInput}
          infoText={props.infoTextInput}
          required={props.required}
          disabled={props.disabled}
          helperText={props.helperText}
          type={props.type === 'acronym' ? 'acronym' : undefined}
        />
      );
      break;

    case 'textarea':
      html = (
        <TextareaFormInput
          label={props.labelInput}
          name={props.nameInput}
          placeholder={props.placeholderInput}
          infoText={props.infoTextInput}
          required={props.required}
          disabled={props.disabled}
          rows={props.rows || 3}
        />
      );
      break;
    case 'select':
      html = (
        <SelectFormInput
          label={props.labelInput}
          name={props.nameInput}
          options={props.options || []}
          infoText={props.infoTextInput}
          required={props.required}
          disabled={props.disabled}
          isMulti={props.isMulti}
        />
      );
      break;
    case 'number':
      html = (
        <InputTextFormInput
          label={props.labelInput}
          name={props.nameInput}
          placeholder={props.placeholderInput}
          infoText={props.infoTextInput}
          required={props.required}
          disabled={props.disabled}
          helperText={props.helperText}
          type="number"
        />
      );
      break;
    case 'multi':
      html = (
        <InputTagsFormInput
          name={props.nameInput}
          label={props.labelInput || ''}
          placeholder={props.placeholderInput || ''}
          disabled={props.disabled}
          infoText={props.infoTextInput}
          required={props.required}
        />
      );
      break;
    default:
      break;
  }
  return (
    <div className="grid md:grid-cols-[auto_480px] lg:grid-cols-[auto_580px] items-center gap-8">
      <TitleInput label={props.labelTitle} link={props.linkTitle} />
      {html}
    </div>
  );
};
