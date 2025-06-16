import type { Meta, StoryObj } from '@storybook/react';
import { Header } from './header';
import { UserDto } from '@unic/shared/user-dto';

const meta: Meta<typeof Header> = {
  component: Header,
  title: 'Header',
};
export default meta;
type Story = StoryObj<typeof Header>;

export const Heading: Story = {
  args: {
    user: {} as UserDto,
    logout: () => console.log('logout'),
  },
};
