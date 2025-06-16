import type { Meta, StoryObj } from '@storybook/react';
import { ContactCard } from './contact-card';

const meta: Meta<typeof ContactCard> = {
  component: ContactCard,
  title: 'ContactCard',
};
export default meta;
type Story = StoryObj<typeof ContactCard>;

export const Primary: Story = {
  args: {
    name: 'Nannan Liu',
    role: 'Professoressa a contratto a titolo gratuito',
    description: (
      <>
        Assegnista di ricerca <br /> Dipartimento di Interpretazione e
        Traduzione
        <br /> Corso della Repubblica 136 - Forlì
        <br /> +39 0543 374 905/6
      </>
    ),
    website: 'https://www.nannanliu.com',
    email: 'nannanliu@mail.com',
    avatar: 'https://picsum.photos/200',
  },
};
