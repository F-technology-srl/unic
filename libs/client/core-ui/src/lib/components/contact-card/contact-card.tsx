import Button from '../button/button';

export interface ContactCardProps {
  name: string;
  avatar?: string;
  role?: string;
  description?: string | JSX.Element;
  descriptionWidth?: string;
  website?: string;
  email?: string;
}

export const ContactCard = (props: ContactCardProps) => {
  return (
    <div className="flex flex-col items-center justify-between gap-6 pt-14 px-4 pb-10 bg-white border border-gray-200 rounded-lg shadow min-w-[384px] max-w-[384px]">
      <div className="flex flex-col items-center gap-3">
        {props.avatar && (
          <img
            className="shadow-md rounded-full w-24 h-24 object-cover"
            src={props.avatar}
            alt={props.name}
          />
        )}
        <div className="flex flex-col gap-1">
          <h5 className="text-xl font-medium text-gray-900 leading-tight text-center">
            {props.name}
          </h5>
          {props.role && (
            <span className="text-sm font-bold text-gray-500 text-center">
              {props.role}
            </span>
          )}
          {props.description && (
            <p
              className={`text-sm font-regular text-gray-500 text-center ${props.descriptionWidth ? props.descriptionWidth : 'max-w-[300px]'}`}
            >
              {props.description}
            </p>
          )}
        </div>
      </div>
      <div className="flex items-center gap-3">
        {props.website && (
          <Button type="primary" size="xs" href={props.website} targetBlank>
            Website
          </Button>
        )}
        {props.email && (
          <Button type="secondary" size="xs" href={`mailto:${props.email}`}>
            Email
          </Button>
        )}
      </div>
    </div>
  );
};
