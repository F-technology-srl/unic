import type { Meta, StoryObj } from '@storybook/react';
import { Select } from './select';

const meta: Meta<typeof Select> = {
  component: Select,
  title: 'Select',
};
export default meta;
type Story = StoryObj<typeof Select>;

export const Primary: Story = {
  args: {
    name: 'select',
    options: [
      { label: 'Option 1', value: 'option1' },
      { label: 'Option 2', value: 'option2' },
      { label: 'Option 3', value: 'option3' },
    ],
    onSelected: (value) => console.log(value),
  },
};
