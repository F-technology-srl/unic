import Button from '../button/button';
import { ExternalLinkIcon } from '../icons';

export interface TitleInputProps {
  label: string;
  link?: {
    url: string;
    target?: string;
  };
}

export const TitleInput = (props: TitleInputProps) => {
  return (
    <div className="flex flex-row justify-left items-center gap-2">
      <span className="text-sm leading-5 font-medium text-gray-700 min-w-min">
        {props.label}
      </span>
      {props.link && props.link?.url && (
        <Button
          href={props.link?.url}
          targetBlank={props.link?.target === '_blank'}
          type="no-bg-no-border"
          size="xs"
          icon={[
            {
              position: 'center',
              icon: <ExternalLinkIcon />,
            },
          ]}
        />
      )}
    </div>
  );
};

export default TitleInput;
