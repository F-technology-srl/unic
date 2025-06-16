import type { Meta, StoryObj } from '@storybook/react';
import { TextareaFormInput } from './textarea';
import { FormProvider, useForm } from 'react-hook-form';

const meta: Meta<typeof TextareaFormInput> = {
  component: TextareaFormInput,
  title: 'Textarea',
  decorators: [
    (Story) => {
      const methods = useForm();

      return (
        <FormProvider {...methods}>
          <Story />
        </FormProvider>
      );
    },
  ],
};
export default meta;
type Story = StoryObj<typeof TextareaFormInput>;

export const Heading: Story = {
  args: {
    label: 'Testo',
    name: 'text',
    required: false,
    disabled: false,
    placeholder: 'Placeholder',
    rows: 6,
  },
};
