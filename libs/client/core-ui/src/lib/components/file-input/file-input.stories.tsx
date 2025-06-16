import type { Meta, StoryObj } from '@storybook/react';
import { FileInput, FileInputProps } from './file-input';
import { useState } from 'react';

const FileInputWithState = (args: FileInputProps) => {
  const [files, setFiles] = useState<File[]>([]);
  return (
    <FileInput
      {...args}
      value={files}
      onChange={(files) => setFiles(Array.from(files))}
    />
  );
};

const meta: Meta<typeof FileInput> = {
  component: FileInput,
  title: 'FileInput',
  render: FileInputWithState,
};
export default meta;
type Story = StoryObj<typeof FileInput>;

export const Heading: Story = {
  args: {
    name: 'file',
    required: false,
    disabled: false,
    error: false,
    loading: false,
    fileCostraints: {
      label: 'SVG, PNG, JPG or GIF (MAX. 800x400px)',
      accept: 'image/svg+xml, image/png, image/jpeg, image/gif',
    },
  },
};
