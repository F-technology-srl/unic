import type { Meta, StoryObj } from '@storybook/react';
import Table, { TableBody, TableHeader, TableProps, TableRow } from './table';

const meta: Meta<typeof Table> = {
  component: Table,
  title: 'Table',
  argTypes: {},
};
export default meta;
type Story = StoryObj<typeof Table>;

// allows multiple items open at a time
const TableStory = (props: TableProps) => {
  return (
    <Table>
      <TableHeader>
        <th>Colonna 1</th>
        <th>Colonna 2</th>
        <th>Colonna 3</th>
      </TableHeader>
      <TableBody>
        <TableRow>
          <td>Riga 1 Colonna 1</td>
          <td>Riga 1 Colonna 2</td>
          <td>Riga 1 Colonna 3</td>
          <td>Riga 1 Colonna 4</td>
        </TableRow>
        <TableRow>
          <td>Riga 2 Colonna 1</td>
          <td>Riga 2 Colonna 2</td>
          <td>Riga 2 Colonna 3</td>
          <td>Riga 2 Colonna 4</td>
        </TableRow>
      </TableBody>
    </Table>
  );
};

export const Primary: Story = {
  render: () => <TableStory />,
  args: {},
};
