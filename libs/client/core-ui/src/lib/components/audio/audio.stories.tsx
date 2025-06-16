import type { Meta, StoryObj } from '@storybook/react';
import { Audio } from './audio';

const meta: Meta<typeof Audio> = {
  component: Audio,
  title: 'Audio',
};
export default meta;
type Story = StoryObj<typeof Audio>;

export const Primary: Story = {
  args: {},
};
