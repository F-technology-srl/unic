import { useController } from 'react-hook-form';
import { ForwardedRef, useState } from 'react';
import { XIcon } from '../icons';
import React from 'react';

export interface InputTagsProps {
  name: string;
  label: string | JSX.Element;
  placeholder: string;
  disabled?: boolean;
  infoText?: string | JSX.Element;
  required?: boolean;
  helperText?: string;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  value?: string;
}

export const InputTags = React.forwardRef(
  ({ ...props }: InputTagsProps, ref: ForwardedRef<HTMLInputElement>) => {
    const { field } = useController<Record<string, Array<string>>>({
      name: props.name,
      rules: { required: props.required },
    });

    const [newTagsInputValue, newTagsInputSetValue] = useState<string>('');
    const currentTagList = field.value || [];

    const addTag = (tag: string) => {
      const currentTagList = field.value || [];
      // split from comma to separate tags
      const tagArray = tag.split(',');
      // remove duplicate tags
      const uniqueTags = tagArray.filter(
        (item) => currentTagList.indexOf(item) === -1,
      );
      const nonEmptyTags = uniqueTags.filter((item) => item !== '');
      field.onChange([...currentTagList, ...nonEmptyTags]);
      newTagsInputSetValue('');
    };

    const removeTag = (tag: string) => {
      const currentTagList = field.value || [];
      field.onChange(currentTagList.filter((item) => item !== tag));
    };

    const handleButtonClick = () => {
      addTag(newTagsInputValue);
    };

    function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
      if (e.key === ',' || e.key === 'Enter') {
        e.stopPropagation();
        e.preventDefault();
        handleButtonClick();
      }
    }

    return (
      <div className="flex flex-col gap-spacer-10 gap-2">
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
          className={`flex flex-wrap items-start bg-gray-50 border-gray-300 text-sm rounded-lg py-3 px-3 border 
            ${currentTagList && currentTagList.length > 0 && 'pb-1'}
            ${props.disabled ? 'border-gray-200' : 'hover:bg-gray-100 hover:border-gray-400 hover:ring-0 hover:ring-transparent '}`}
        >
          {currentTagList.map((tag, index) => (
            <div
              key={index}
              className=" bg-gray-100 rounded-md mr-2 mb-2 flex items-center"
            >
              <span
                className={` text-12 mx-2 ${props.disabled ? 'text-gray-400' : 'text-gray-600'}`}
              >
                {tag}
              </span>
              {!props.disabled && (
                <button onClick={() => removeTag(tag)} className="ml-1 ">
                  <XIcon className="w-2 h-2 text-gray-500" />
                </button>
              )}
            </div>
          ))}
          <input
            name={props.name}
            value={newTagsInputValue}
            onChange={(e) => newTagsInputSetValue(e.target.value)}
            placeholder={
              currentTagList && currentTagList.length > 0
                ? ''
                : props.placeholder
            }
            onKeyDown={(e) => handleKeyDown(e)}
            className="bg-transparent focus:border-none focus:ring-0 focus:outline-none text-gray-600 text-12 flex-grow"
            ref={ref}
            disabled={props.disabled}
            onBlur={(e) => {
              newTagsInputSetValue(e.target.value);
              handleButtonClick();
            }}
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

export function InputTagsFormInput(props: Omit<InputTagsProps, 'onChange'>) {
  const { field, fieldState } = useController({
    name: props.name,
    rules: { required: props.required },
  });

  return (
    <InputTags
      {...props}
      onChange={(event) => {
        field.onChange(event.target.value === '' ? null : event.target.value);
      }}
      value={
        typeof field.value === 'undefined' || field.value === null
          ? ''
          : field.value
      }
      helperText={fieldState.error?.message}
      infoText={props.infoText}
      ref={field.ref}
    />
  );
}

export default InputTags;
