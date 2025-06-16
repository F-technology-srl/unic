import React from 'react';

export interface TableProps {
  type?: 'primary' | 'secondary';
  className?: string;
}

export const Table = (props: React.PropsWithChildren<TableProps>) => {
  return (
    <div className="table relative w-full">
      <table
        className={`w-full border border-gray-100 shadow-custom-shadow-table rounded-lg`}
      >
        {props.children}
      </table>
    </div>
  );
};

export const TableHeader = (props: React.PropsWithChildren<TableProps>) => {
  const childrenArray = React.Children.toArray(props.children);

  return (
    <thead className="bg-gray-50">
      <tr>
        {React.Children.map(childrenArray, (child, key) => {
          return (
            <th
              key={key}
              scope="col"
              className={`p-4 text-left text-xs font-semibold text-gray-500 uppercase`}
            >
              {child}
            </th>
          );
        })}
      </tr>
    </thead>
  );
};

export const TableBody = (props: React.PropsWithChildren<TableProps>) => {
  return <tbody className={`bg-white`}>{props.children}</tbody>;
};

export const TableFooter = (props: React.PropsWithChildren<TableProps>) => {
  return (
    <tfoot className={`bg-white w-full justify-start`}>
      <tr>{props.children}</tr>
    </tfoot>
  );
};

export const TableRow = (props: React.PropsWithChildren<TableProps>) => {
  const childrenArray = React.Children.toArray(props.children);

  return (
    <tr className={``}>
      {React.Children.map(childrenArray, (child, key) => {
        return (
          child.toString().trim() !== '' && (
            <td
              key={key}
              /* scope={key === 0 ? 'row' : undefined} */
              className={`p-4 text-left text-gray-900 text-sm font-normal align-top`}
            >
              {child}
            </td>
          )
        );
      })}
    </tr>
  );
};

export default Table;
