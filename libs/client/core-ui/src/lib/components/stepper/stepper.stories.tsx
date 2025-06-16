import type { Meta, StoryObj } from '@storybook/react';
import { Stepper } from './stepper';

const meta: Meta<typeof Stepper> = {
  component: Stepper,
  title: 'Stepper',
  decorators: [
    (Story) => {
      return (
        <div className="flex flex-col gap-6">
          <Stepper
            number={1}
            label="Select one"
            state="disabled"
            onClick={() => console.log('clicked 1')}
          />
          <Stepper
            number={2}
            label="Select two"
            state="active"
            onClick={() => console.log('clicked 2')}
          />
          <Stepper
            number={3}
            label="Select three"
            state="completed"
            onClick={() => console.log('clicked 3')}
          />
        </div>
      );
    },
  ],
};
export default meta;
type Story = StoryObj<typeof Stepper>;

export const Primary: Story = {
  args: {},
};
