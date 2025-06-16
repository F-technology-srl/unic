import type { Meta, StoryObj } from '@storybook/react';
import { FormProvider, useForm } from 'react-hook-form';
import { RadioButton } from './radio-button';

const meta: Meta<typeof RadioButton> = {
  component: RadioButton,
  title: 'Radio Button',
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
type Story = StoryObj<typeof RadioButton>;

export const Heading: Story = {
  args: {
    name: 'radio-s',
    values: [
      { value: 'color-1', label: 'Colore 1' },
      { value: 'color-2', label: 'Colore 2' },
      { value: 'color-3', label: 'Colore 3' },
    ],
    required: true,
    disabled: false,
    selected: 'color-2',
  },
};
