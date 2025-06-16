import type { Meta, StoryObj } from '@storybook/react';
import { Video } from './video';

const meta: Meta<typeof Video> = {
  component: Video,
  title: 'Video',
};
export default meta;
type Story = StoryObj<typeof Video>;

export const Primary: Story = {
  args: {},
};
