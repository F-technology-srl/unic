import type { Meta, StoryObj } from '@storybook/react';
import { TitleInput } from './title-input';

const meta: Meta<typeof TitleInput> = {
  component: TitleInput,
  title: 'TitleInput',
};
export default meta;
type Story = StoryObj<typeof TitleInput>;

export const Primary: Story = {
  args: {
    label: 'Name',
    link: {
      url: '#',
      target: '_blank',
    },
  },
};
