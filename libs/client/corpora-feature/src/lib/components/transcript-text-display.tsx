import React, { useState, useEffect } from 'react';
import { setWordInBold } from '../utils';

export interface TranscriptTextDisplayProps {
  full_text?: string;
  offset?: number;
  offsetLength?: number;
}

export const TranscriptTextDisplay = (props: TranscriptTextDisplayProps) => {
  const [rowsToShow, setRowsToShow] = useState<string[]>([]);
  const [rowSelected, setRowSelected] = useState<number | null>();

  useEffect(() => {
    const elemento = document.getElementById(`row-${rowSelected}`);
    if (elemento) {
      elemento.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [rowSelected]);

  useEffect(() => {
    const delimiterEndRow = '//';
    const delimiterToSostituire = `//`;

    const rowWithBoldText = setWordInBold({
      full_text: props.full_text,
      offset: props.offset,
      offsetLength: props.offsetLength,
    });

    const rowsSplitted =
      rowWithBoldText
        ?.split(delimiterEndRow)
        ?.map((row) =>
          row.trim().length ? row + `${delimiterToSostituire}` : '',
        ) ?? [];
    setRowsToShow(rowsSplitted);

    if (props.offset && props.offsetLength) {
      const offsetPreviusText = props.full_text?.slice(0, props.offset);
      const numberOfDelimiters =
        (offsetPreviusText?.split(delimiterEndRow).length ?? 0) - 1;

      setRowSelected(numberOfDelimiters >= 0 ? numberOfDelimiters : null);
    }
  }, [props.full_text, props.offset, props.offsetLength]);

  return (
    <div className="max-h-[1372px] overflow-y-auto scrollbar">
      {rowsToShow.map((riga, index) => {
        const isRowSelected = index === rowSelected;
        const selectedRowClass = isRowSelected ? ' bg-gray-100 rounded-sm' : '';
        return (
          <p
            className={'sm-normal text-gray-500 mb-2 py-2 ' + selectedRowClass}
            key={index}
            id={`row-${index}`}
            dangerouslySetInnerHTML={{
              __html: riga,
            }}
          ></p>
        );
      })}
    </div>
  );
};
