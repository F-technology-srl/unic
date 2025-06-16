import {
  ChangeEvent,
  DetailedHTMLProps,
  ForwardedRef,
  TextareaHTMLAttributes,
} from 'react';
import React from 'react';
import { useController } from 'react-hook-form';

export interface TextareaProps
  extends Omit<
    DetailedHTMLProps<
      TextareaHTMLAttributes<HTMLTextAreaElement>,
      HTMLTextAreaElement
    >,
    'onChange'
  > {
  label?: string | JSX.Element;
  placeholder?: string;
  onChange?: (value: string) => void;
  helperText?: string;
  infoText?: string | JSX.Element;
  cols?: number;
  rows?: number;
  name: string;
  required?: boolean;
  charlimit?: number;
  text?: string;
}

export const Textarea = React.forwardRef(
  ({ ...props }: TextareaProps, ref: ForwardedRef<HTMLTextAreaElement>) => {
    const charlimit = props.charlimit ? props.charlimit : 0;

    function handleOnChange(
      event: ChangeEvent<HTMLTextAreaElement>,
      charlimit: number,
    ) {
      props.onChange?.(event.target.value);
      if (charlimit > 0) {
        const element = event.target as HTMLTextAreaElement;
        const value = element.value;
        if (charlimit && value.length > charlimit) {
          props.onChange?.(value.substring(0, props.charlimit));
        }
      }
    }

    return (
      <div className="flex flex-col gap-2">
        {props.label && (
          <label
            htmlFor="message"
            className={`text-sm font-medium ${
              props.disabled ? 'text-gray-400' : 'text-gray-900'
            }`}
          >
            {props.label}
            <span className="text-red-500 pl-1">
              {props.required ? '*' : ''}
            </span>
          </label>
        )}
        <textarea
          id={`textarea-${props.name}`}
          name={props.name}
          rows={props.rows}
          cols={props.cols}
          required={props.required}
          className={`py-3 px-4 w-full text-sm bg-gray-50 border-gray-300 rounded-lg border  ${
            props.disabled
              ? 'border-gray-200 text-gray-400'
              : 'text-gray-500 hover:bg-gray-100 hover:border-gray-400 hover:ring-0 hover:ring-transparent focus:ring-0 focus:outline-none focus:border-gray-400'
          }`}
          placeholder={props.placeholder ? props.placeholder : ''}
          disabled={props.disabled}
          onChange={(e) => handleOnChange(e, charlimit)}
          ref={ref}
          value={props.value || ''}
        />
        {props.helperText && (
          <span className="text-xs text-red-500">{props.helperText}</span>
        )}
        {props.infoText && (
          <span
            className={`text-xs ${
              props.disabled ? 'text-gray-400' : 'text-gray-500'
            }`}
          >
            {props.infoText}
          </span>
        )}
      </div>
    );
  },
);

export function TextareaFormInput(
  props: Omit<TextareaProps, 'onChange' | 'onBlur'> & {
    name: string;
  },
) {
  const { field, fieldState } = useController({
    name: props.name,
    rules: { required: props.required },
  });

  return (
    <Textarea
      {...props}
      onBlur={field.onBlur}
      helperText={fieldState.error?.message}
      infoText={props.infoText}
      onChange={field.onChange}
      value={field.value || ''}
      ref={field.ref}
    />
  );
}

export default Textarea;
