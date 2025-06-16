import type { Meta, StoryObj } from '@storybook/react';
import { InputTextFormInput } from './input-text';
import { FormProvider, useForm } from 'react-hook-form';
import React from 'react';

const meta: Meta<typeof InputTextFormInput> = {
  component: InputTextFormInput,
  title: 'Input',
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
type Story = StoryObj<typeof InputTextFormInput>;

export const Heading: Story = {
  args: {
    label: 'Name',
    placeholder: 'Name',
    name: 'name',
    disabled: false,
    type: 'email',
  },
};
