import type { Meta, StoryObj } from '@storybook/react';
import { Card } from './card';

const meta: Meta<typeof Card> = {
  component: Card,
  title: 'Card',
};
export default meta;
type Story = StoryObj<typeof Card>;

export const Primary: Story = {
  args: {
    title: 'Explore UNIC',
    description: 'Explore 114 interpreting corpus in one click',
    button: {
      label: 'string',
      onClick: () => console.log('button clicked'),
      href: 'https://www.example.com',
    },
  },
};
