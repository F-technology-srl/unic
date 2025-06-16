import React from 'react';
import { ExternalLinkIcon } from '../icons';
import Button from '../button/button';

export interface AccordionProps {
  title?: string;
  content?: JSX.Element | string;
  noResults?: boolean;
  onClick?: () => void;
}

export const Accordion = (props: AccordionProps) => {
  return (
    <div className="flex flex-col gap-0 w-full hover:shadow-md rounded-lg">
      <div className="bg-gray-100 w-full p-5 text-blue-800 text-base leading-normal border-gray-200 border border-b-0 flex flex-row justify-between rounded-t-lg">
        {props.title || 'No results'}
        {!props.noResults && (
          <Button
            icon={[
              {
                position: 'center',
                icon: (
                  <ExternalLinkIcon className="cursor-pointer hover:stroke-blue-500 hover:fill-blue-500" />
                ),
              },
            ]}
            type="no-bg-no-border"
            size="regular"
            onClick={props.onClick}
          />
        )}{' '}
      </div>
      <div className="w-full p-5 text-gray-900 text-base leading-normal bg-white border border-gray-200 rounded-b-lg">
        {props.content || 'No results to display'}
      </div>
    </div>
  );
};
