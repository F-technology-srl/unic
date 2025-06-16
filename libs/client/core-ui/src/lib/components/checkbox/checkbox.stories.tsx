import type { Meta, StoryObj } from '@storybook/react';
import { CheckboxFormInput } from './checkbox';
import { FormProvider, useForm } from 'react-hook-form';

const meta: Meta<typeof CheckboxFormInput> = {
  component: CheckboxFormInput,
  title: 'Checkbox',
  decorators: [
    (Story) => {
      const methods = useForm({
        defaultValues: {
          checkbox: true,
        },
      });

      return (
        <FormProvider {...methods}>
          <Story />
        </FormProvider>
      );
    },
  ],
};
export default meta;
type Story = StoryObj<typeof CheckboxFormInput>;

export const Primary: Story = {
  args: {
    name: 'checkbox',
    label: 'Remember me',
  },
};
