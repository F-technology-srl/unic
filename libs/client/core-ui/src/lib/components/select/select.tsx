import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useController } from 'react-hook-form';
import { AngleDownIcon } from '../icons';
import { Checkbox } from '../checkbox/checkbox';
import { InputText } from '../input-text/input-text';
import { useClickOutside } from '@unic/client-global-data-access';

export interface SelectProps<Type> {
  name: string;
  label?: string | JSX.Element;
  text?: string;
  disabled?: boolean;
  required?: boolean;
  placeholder?: string;
  options: Array<{
    label: string;
    value: string | number | boolean;
  }>;
  selected?: Type;
  onSelected: (item?: Type) => void;
  helperText?: string;
  infoText?: JSX.Element | string | null;
  isMulti?: boolean;
  type?: string;
  search?: string;
  hideSearchBox?: boolean;
}

export const Select = React.forwardRef(
  <Type extends string | number | undefined | null>(
    props: SelectProps<Type> &
      Omit<React.HTMLAttributes<HTMLDivElement>, 'children' | 'placeholder'>,
    ref: React.ForwardedRef<HTMLSelectElement>,
  ) => {
    const inputRef = useRef<HTMLInputElement>(null);
    const [isOpen, setIsOpen] = useState(false);
    const container = useRef<HTMLDivElement>(null);
    const [search, setSearch] = useState('');

    const toggling: React.MouseEventHandler<HTMLButtonElement> = (event) => {
      if (event.type === 'keydown') {
        if (event.target === inputRef.current) {
          event.preventDefault();
          return;
        }
      }
      event.preventDefault();
      if (props.disabled) return;
      setIsOpen((before) => !before);
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
        }
      }, 300);
    };

    useClickOutside(container, (ev) => {
      if (isOpen) {
        ev.preventDefault();
        ev.stopPropagation();
        setIsOpen(false);
      }
    });

    // Funzione per filtrare le opzioni in base alla ricerca
    const filteredOptions = props.isMulti
      ? search
        ? props.options.filter((option) =>
            option.label
              .toString()
              .toLowerCase()
              .includes(search.toLowerCase()),
          )
        : props.options
      : props.options;

    const optionSelected = useMemo(() => {
      if (props.isMulti && Array.isArray(props.selected)) {
        // return an object label, value with label join by ','
        return {
          label: props.selected
            .map((item) => {
              return props.options.find((option) => option.value === item)
                ?.label;
            })
            .join(', '),
          value: props.selected,
        };
      }
      return props.options.find((option) => option.value === props.selected);
    }, [props.options, props.selected]);

    useEffect(() => {
      function handleExit(ev: KeyboardEvent) {
        if (ev.key === 'Escape' && isOpen) {
          ev.preventDefault();
          ev.stopPropagation();
          setIsOpen(false);
        }
      }
      document.addEventListener('keydown', handleExit);
      return () => {
        document.removeEventListener('keydown', handleExit);
      };
    }, [isOpen]);

    return (
      <div
        className={`flex flex-col gap-spacer-8 w-full  ${
          props.className || ''
        }`}
      >
        <div className="relative" ref={container}>
          <div className="flex flex-col gap-2">
            <select
              ref={ref}
              className="hidden"
              value={`${props.selected}`}
              onChange={() => null}
              disabled={props.disabled}
              name={props.name}
              required={props.required}
              id={props.id || props.name.toLocaleLowerCase().replace(' ', '-')}
            >
              {props.options.map((option) => {
                return (
                  <option key={String(option.value)} value={`${option.value}`}>
                    {option.label}
                  </option>
                );
              })}
            </select>

            {props.label && (
              <label
                //htmlFor={`select-${props.name}`}
                className={`text-sm font-medium ${props.disabled ? 'text-gray-400' : 'text-gray-900'}`}
              >
                {props.label}
                <span className="text-red-500 pl-1">
                  {props.required ? '*' : ''}
                </span>
              </label>
            )}
            <div className="flex gap-spacer-8 items-center">
              <button
                id={'select-' + props.name}
                data-dropdown-toggle={`select-menu-${props.name}`}
                data-dropdown-placement="bottom"
                className={`bg-gray-50 border-gray-300 border ${
                  props.disabled
                    ? 'text-gray-400 border-gray-200'
                    : 'text-gray-500 border-gray-300 hover:bg-gray-100 border hover:border-gray-400 hover:ring-0 hover:ring-transparent'
                } text-sm rounded-lg block w-full py-3 px-4 ${
                  props.type && props.type !== 'password' ? 'ps-4' : ''
                }`}
                type="button"
                onClick={toggling}
              >
                <span className="flex flex-grow truncate justify-between items-center">
                  {optionSelected?.label
                    ? optionSelected.label.charAt(0).toUpperCase() +
                      optionSelected.label.slice(1)
                    : props.placeholder || 'Select'}

                  <AngleDownIcon className="w-18 text-right" />
                </span>
              </button>
            </div>
          </div>

          <div
            id={`select-menu-${props.name}`}
            className={`absolute p-4 z-[100] bg-white w-full shadow-custom-shadow-dropdown mt-2 rounded-lg flex flex-col ${
              isOpen ? 'block' : 'hidden'
            }`}
          >
            {props.isMulti &&
              !props.hideSearchBox && ( // add pt-4 pr-4 pl-4 pb-3
                <div>
                  {/* componente ricerca input */}
                  <div className="relative pt-4 pr-4 pl-4 pb-1.5">
                    <InputText
                      type="search"
                      name="input-group-search"
                      placeholder="Search"
                      label="Search"
                      onChange={(e) => setSearch(e.target.value)}
                    />
                  </div>
                </div>
              )}
            <ul
              className={`flex flex-col rounded-md shadow-default ${
                // remove gap-3
                props.disabled ? 'opacity-50' : ''
              } overflow-y-auto bg-white ${props.isMulti ? 'max-h-40' : ''}`}
              aria-labelledby={
                'multiselect-' +
                props.name.toLocaleLowerCase().replace(' ', '-')
              }
            >
              {!props.options ||
                (props.options.length === 0 && <li className="">No data</li>)}
              {filteredOptions.map((option, key) => (
                <li
                  key={String(option.value)
                    ?.toLocaleLowerCase()
                    .replace(' ', '-')}
                  className={` ${
                    Array.isArray(props.selected) &&
                    props.selected?.find((item) => item === option.value)
                      ? 'bg-gray-1 text-primary-text'
                      : 'bg-white text-primary-text'
                  } cursor-pointer items-center justify-between gap-4 ps-6 hover:bg-gray-100
                  ${props.isMulti ? 'pt-1.5 pb-1.5' : 'pt-2 pb-2'}
                  `} // remove ps-2 add pb-2 pt-2 ps-6
                  id={
                    'multiselect-' +
                    props.name.toLocaleLowerCase() +
                    '-' +
                    String(option.value)
                  }
                >
                  {props.isMulti ? (
                    <Checkbox
                      name={props.name + '-' + String(option.value)}
                      label={option.label}
                      checked={
                        !!Array.isArray(props.selected) &&
                        props.selected?.find(
                          (item) => item === option.value,
                        ) !== undefined
                      }
                      onCheckedChange={() => {
                        props.onSelected(option.value as Type);
                      }}
                    />
                  ) : (
                    <div
                      className="flex flex-row justify-start gap-4 flex-grow"
                      onClick={(e) => {
                        props.onSelected(option.value as Type);
                        setIsOpen(false);
                      }}
                    >
                      <div className="flex flex-row gap-4 items-center justify-start text-sm">
                        {option.label.charAt(0).toUpperCase() +
                          option.label.slice(1)}
                      </div>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </div>
          {props.helperText && (
            <div>
              <span className={`text-xs text-red-500`}>{props.helperText}</span>
            </div>
          )}
          {props.infoText && (
            <div>
              <span
                className={`text-xs ${
                  props.disabled ? 'text-gray-400' : 'text-gray-500'
                }`}
              >
                {props.infoText}
              </span>
            </div>
          )}
        </div>
      </div>
    );
  },
);

export function SelectFormInput<GenericType>(
  props: Omit<
    SelectProps<string | boolean | number | string[]>,
    'onSelected' | 'selected'
  >,
) {
  const { field, fieldState } = useController({
    name: props.name,
    rules: { required: props.required },
  });

  const fieldValue: Array<GenericType | string | number> = field.value;
  const mappedFieldValue = () => {
    if (typeof fieldValue === 'number' || typeof fieldValue === 'boolean')
      return String(fieldValue);

    return fieldValue as Array<string>;
  };

  return (
    <Select
      {...props}
      label={props.label}
      name={props.name}
      options={props.options.sort((a, b) => a.label.localeCompare(b.label))}
      selected={!props.isMulti ? field.value : mappedFieldValue() || []}
      // onselected verify is value is in array
      onSelected={(value) => {
        if (!value) {
          field.onChange([]);
          return;
        }

        if (mappedFieldValue()?.includes(String(value))) {
          if (props.isMulti) {
            field.onChange(
              fieldValue.filter((item) => {
                return item !== value;
              }),
            );
          } else {
            field.onChange(value);
          }
        } else {
          const newValue: GenericType | string | number = value;
          if (props.isMulti) {
            field.onChange([...(fieldValue || []), newValue]);
          } else {
            field.onChange(newValue);
          }
        }
      }}
      placeholder={props.placeholder}
      required={props.required}
      disabled={props.disabled}
      ref={field.ref}
      helperText={fieldState.error?.message}
      infoText={props.infoText}
    />
  );
}

export default Select;
