import type { Meta, StoryObj } from '@storybook/react';
import { Tabs } from './tabs';

const meta: Meta<typeof Tabs> = {
  component: Tabs,
  title: 'Tabs',
};
export default meta;
type Story = StoryObj<typeof Tabs>;

export const Heading: Story = {
  args: {
    tabs: [
      {
        label: 'Tab 1',
        onClick: () => console.log('click tab 1'),
        key: 'tab1',
      },
      {
        label: 'Tab 2',
        onClick: () => console.log('click tab 2'),
        key: 'tab2',
      },
      {
        label: 'Tab 3',
        onClick: () => console.log('click tab 3'),
        key: 'tab3',
      },
    ],
  },
};
