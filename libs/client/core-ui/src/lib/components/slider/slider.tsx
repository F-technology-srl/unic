import React, { useState } from 'react';
import { useController } from 'react-hook-form';

export interface SliderProps {
  label: string;
  min: number;
  max: number;
  name: string;
}

export const Slider = (props: SliderProps) => {
  const { label, min, max, name } = props;
  const [timeAsString, setTimeAsString] = useState('00:00:00');

  const { field } = useController({
    name,
    rules: { required: true },
  });

  const updateTextField = (event: React.ChangeEvent<HTMLInputElement>) => {
    const seconds = parseInt(event.target.value, 10);
    const hours = Math.floor(seconds / 3600)
      .toString()
      .padStart(2, '0');
    const minutes = Math.floor((seconds % 3600) / 60)
      .toString()
      .padStart(2, '0');
    const secs = (seconds % 60).toString().padStart(2, '0');
    setTimeAsString(`${hours}:${minutes}:${secs}`);
  };

  return (
    <>
      <label
        htmlFor="default-range"
        className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
      >
        {label}
      </label>
      <input
        id="default-range"
        type="range"
        min={min}
        max={max}
        step="1"
        onChange={(event) => {
          updateTextField(event);
          field.onChange(event);
        }}
        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
      />
      <input
        value={timeAsString}
        type="text"
        id="large-input"
        onChange={() => {
          return;
        }}
        className="block w-full p-4 text-gray-900 border border-gray-300 rounded-lg bg-gray-50 text-base focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
      />
    </>
  );
};
