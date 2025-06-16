import type { Meta, StoryObj } from '@storybook/react';
import { Button } from './button';
import { SearchIcon } from '../icons';

const meta: Meta<typeof Button> = {
  component: Button,
  title: 'Button',
};
export default meta;
type Story = StoryObj<typeof Button>;

export const ButtonDefault: Story = {
  args: {
    type: 'primary',
    size: 'regular',
    onClick: () => console.log('button clicked'),
    disabled: false,
    icon: <SearchIcon />,
    iconPosition: 'left',
    children: 'About',
  },
};

export const IconButton: Story = {
  args: {
    type: 'primary',
    size: 'regular',
    onClick: () => console.log('button clicked'),
    disabled: false,
    icon: <SearchIcon />,
    iconPosition: 'center',
  },
};
