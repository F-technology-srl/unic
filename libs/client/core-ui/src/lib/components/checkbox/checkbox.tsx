import React, { ForwardedRef } from 'react';
import { ChangeEventHandler } from 'react';
import { useController } from 'react-hook-form';

export interface CheckboxProps {
  label?: string | JSX.Element;
  checked?: boolean;
  name: string;
  required?: boolean;
  value?: string;
  disabled?: boolean;
  onCheckedChange?: ChangeEventHandler<HTMLInputElement>;
}

export const Checkbox = React.forwardRef(
  ({ ...props }: CheckboxProps, ref: ForwardedRef<HTMLInputElement>) => {
    return (
      <div className="flex items-center">
        <input
          id={`checkbox-${props.name}`}
          type="checkbox"
          checked={props.checked}
          disabled={props.disabled}
          className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded hover:ring-transparent focus:ring-0 focus:ring-offset-0"
          onChange={props.onCheckedChange}
          ref={ref}
        />
        {props.label && (
          <label
            htmlFor={`checkbox-${props.name}`}
            className={`ms-2 text-sm font-medium ${
              props.disabled ? 'text-gray-400' : 'text-gray-900'
            }`}
          >
            {props.label}
          </label>
        )}
      </div>
    );
  },
);

export const CheckboxFormInput = (props: CheckboxProps) => {
  const { field } = useController({
    name: props.name,
    rules: { required: props.required },
  });

  return (
    <Checkbox
      name={props.name}
      label={props.label}
      required={props.required}
      disabled={props.disabled}
      checked={field.value || false}
      onCheckedChange={field.onChange}
      ref={field.ref}
    />
  );
};

export default Checkbox;
