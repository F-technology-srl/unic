interface KeyValueTableProps {
  data: { label: string; value: string }[];
  className?: string;
}

export const KeyValueTable = ({ data, className = '' }: KeyValueTableProps) => {
  return (
    <div
      className={`table w-full border border-gray-100 shadow-custom-shadow-table rounded-lg ${className}`}
    >
      <table className="w-full border-collapse">
        <tbody>
          {data.map((item, index) => (
            <tr key={index} className="border-t first:border-t-0">
              <th
                scope="row"
                className="bg-gray-50 text-left align-top p-4 text-xs font-semibold text-gray-500 w-1/4"
              >
                {item.label}
              </th>
              <td className="p-4 text-sm text-gray-900 align-top">
                {item.value}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default KeyValueTable;
