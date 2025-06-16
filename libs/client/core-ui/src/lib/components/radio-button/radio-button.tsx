import React, { ForwardedRef } from 'react';
import { useController } from 'react-hook-form';

export interface RadioButtonProps {
  name: string;
  values: Array<{ value: string; label: string }>;
  required?: boolean;
  disabled?: boolean;
  selected?: string;
  flexDirection?: 'row' | 'column';
  checked?: boolean;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur?: (event: React.FocusEvent<HTMLInputElement>) => void;
  inline?: boolean;
  id?: string;
  className?: string;
  label?: string;
}

export const RadioButton = React.forwardRef(
  (
    {
      values,
      name,
      selected,
      onChange,
      onBlur,
      disabled,
      inline,
      label,
      required,
      id,
    }: RadioButtonProps,
    ref: ForwardedRef<HTMLInputElement>,
  ) => {
    return (
      <div className={`flex ${inline ? 'flex-row' : 'flex-col'} gap-2`}>
        {label && (
          <label
            htmlFor={id || `input-${name}`}
            className={`text-sm font-medium ${disabled ? 'text-gray-400' : 'text-gray-900'}`}
          >
            {label}
            {required && <span className="text-red-500 pl-1">*</span>}
          </label>
        )}
        {values.map((item, key) => (
          <div className="flex items-center gap-2" key={key}>
            <input
              type="radio"
              id={id || `radio-${name}-${key}`}
              name={name}
              value={item.value}
              checked={selected === item.value}
              onChange={onChange}
              onBlur={onBlur}
              disabled={disabled}
              ref={ref}
              className={`w-4 h-4 ${disabled ? 'text-gray-400' : 'text-blue-600'} bg-gray-100 border-gray-300 hover:ring-transparent focus:ring-0 focus:ring-offset-0`}
            />
            <label
              htmlFor={`radio-${name}-${key}`}
              className={`text-sm font-medium ${disabled ? 'text-gray-400' : 'text-gray-900'}`}
            >
              {item.label}
            </label>
          </div>
        ))}
      </div>
    );
  },
);

export const RadioButtonFormInput = (
  props: Omit<RadioButtonProps, 'checked' | 'onChange' | 'onBlur'>,
) => {
  const { field } = useController({
    name: props.name,
    defaultValue: props.selected || '',
    rules: { required: props.required },
  });

  return (
    <RadioButton
      {...props}
      selected={field.value}
      onChange={field.onChange}
      onBlur={field.onBlur}
      ref={field.ref}
    />
  );
};
