import 'reflect-metadata';
import { ForwardedRef } from 'react';
import { EmailIcon, SearchIcon } from '../icons';
import { useController } from 'react-hook-form';
import React from 'react';
import { generateSlug } from '@unic/shared/corpora-dto';

export interface InputTextProps {
  label?: string | JSX.Element;
  name: string;
  type?: 'email' | 'search' | 'password' | 'number' | 'hidden' | 'acronym';
  helperText?: string;
  infoText?: string | JSX.Element;
  disabled?: boolean;
  placeholder?: string;
  required?: boolean;
  onChange?: React.ChangeEventHandler<HTMLInputElement>;
  value?: string;
  onKeyDown?: React.KeyboardEventHandler<HTMLInputElement>;
  className?: string;
}

export const InputText = React.forwardRef(
  ({ ...props }: InputTextProps, ref: ForwardedRef<HTMLInputElement>) => {
    return (
      <div className={`flex flex-col gap-2 ${props.className ?? ''}`}>
        {props.label && (
          <label
            htmlFor={`input-${props.name}`}
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
        <div
          className={`relative ${props.type !== 'hidden' ? 'bg-gray-50 border-gray-300 rounded-lg border hover:bg-gray-100 hover:border-gray-400 hover:ring-0 hover:ring-transparent' : ''}`}
        >
          {props.type &&
            props.type !== 'password' &&
            props.type !== 'acronym' && (
              <div className="absolute inset-y-0 start-0 flex items-center ps-3.5 pointer-events-none">
                {props.type === 'email' && <EmailIcon />}
                {props.type === 'search' && (
                  <SearchIcon className="w-4 h-4 text-gray-500" />
                )}
              </div>
            )}
          <input
            type={props.type && props.type !== 'acronym' ? props.type : 'text'}
            name={props.name}
            id={`input-${props.name}`}
            className={`bg-transparent focus:ring-0 focus:outline-none border-transparent focus:border-transparent ${
              props.disabled ? 'text-gray-400' : 'text-gray-500'
            } text-sm rounded-lg block w-full px-4 ${
              props.type &&
              props.type !== 'password' &&
              props.type !== 'number' &&
              props.type !== 'acronym' &&
              'ps-10'
            } ${props.className || ''} ${props.type === 'search' ? 'py-2' : 'py-3'}`}
            placeholder={props.placeholder ? props.placeholder : ''}
            disabled={props.disabled}
            required={props.required}
            onChange={props.onChange}
            value={
              props.type === 'number' && !isNaN(Number(props.value))
                ? Number(props.value)
                : props.value
            }
            ref={ref}
            onKeyDown={props.onKeyDown}
          />
        </div>
        {props.helperText && (
          <p className="text-xs text-red-500 ">{props.helperText}</p>
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

export function InputTextFormInput(props: Omit<InputTextProps, 'onChange'>) {
  const { field, fieldState } = useController({
    name: props.name,
    rules: { required: props.required },
  });

  return (
    <InputText
      {...props}
      onChange={(event) => {
        field.onChange(
          event.target.value === ''
            ? null
            : props.type === 'acronym'
              ? generateSlug(event.target.value, true).toUpperCase()
              : event.target.value,
        );
      }}
      value={
        typeof field.value === 'undefined' || field.value === null
          ? ''
          : field.value
      }
      helperText={props.helperText || fieldState.error?.message}
      infoText={props.infoText}
      ref={field.ref}
    />
  );
}

export default InputText;
