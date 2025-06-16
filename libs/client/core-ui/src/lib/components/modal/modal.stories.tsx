import type { Meta, StoryObj } from '@storybook/react';
import { Modal } from './modal';
import Button from '../button/button';
import { ButtonText } from '../button-text/button-text';

const meta: Meta<typeof Modal> = {
  component: Modal,
  title: 'Modal',
};
export default meta;
type Story = StoryObj<typeof Modal>;

export const Heading: Story = {
  args: {
    triggerElement: (
      <Button type="primary" size="regular">
        Test
      </Button>
    ),
    children: <div>TEST</div>,
  },
};
