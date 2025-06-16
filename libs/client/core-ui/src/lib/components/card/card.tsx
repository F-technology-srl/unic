import { Button } from '../button/button';

export interface CardProps {
  title: string;
  description: string;
  button: {
    label: string;
    onClick?: () => void;
    href?: string;
  };
}

export const Card = (props: CardProps) => {
  return (
    <div className="flex flex-col items-start justify-between gap-8 min-h-[214px] p-6 bg-white border border-gray-200 rounded-lg shadow-md max-w-sm w-full hover:bg-gray-50 hover:shadow-lg">
      <div className="flex flex-col gap-2">
        <h5 className="text-2xl font-bold text-gray-900 leading-tight">
          {props.title}
        </h5>
        <p className="font-normal text-gray-500 ">{props.description}</p>
      </div>
      <Button
        type="primary"
        size="regular"
        onClick={props.button.onClick}
        href={props.button.href}
      >
        {props.button.label}
      </Button>
    </div>
  );
};
