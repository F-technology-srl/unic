type ButtonType =
  | 'primary'
  | 'secondary'
  | 'no-bg-no-border'
  | 'outlined-primary'
  | 'outlined-secondary';
type ButtonSize = 'regular' | 'xs' | 'xxs' | 'round' | 'round-no-border';

export interface ButtonProps {
  type: ButtonType;
  size: ButtonSize;
  icon?: [
    {
      position: 'left' | 'right' | 'center';
      icon: JSX.Element;
    },
  ];
  onClick?: () => void;
  href?: string;
  disabled?: boolean;
  targetBlank?: boolean;
  isSubmit?: boolean;
  classButton?: string;
  className?: string;
  download?: boolean;
}

export const Button = (props: React.PropsWithChildren<ButtonProps>) => {
  let bgColor = '';
  let textColor = '';
  let border = '';
  const padding =
    props.type !== 'no-bg-no-border' &&
    (props.icon?.find((icon) => icon.position === 'center')
      ? 'p-2'
      : props.size === 'regular'
        ? 'px-5 py-2.5'
        : props.size === 'round'
          ? 'p-[7px]'
          : props.size === 'round-no-border'
            ? 'p-2 border-none'
            : 'px-3 py-2');

  switch (props.type) {
    case 'primary':
      bgColor = 'bg-blue-800 hover:bg-blue-700 active:bg-blue-600';
      textColor = 'text-white';
      border = 'border-transparent';
      break;
    case 'secondary':
      bgColor = 'bg-white hover:bg-gray-50 active:bg-gray-100';
      textColor = 'text-gray-800 disabled:text-gray-300';
      border = 'border-gray-200';
      break;
    case 'outlined-primary':
      bgColor = 'bg-transparent';
      textColor = 'text-blue-700 hover:text-blue-800 disabled:text-gray-300';
      border = 'border-blue-700 hover:border-blue-800';
      break;
    case 'outlined-secondary':
      bgColor =
        'bg-transparent border-gray-200 hover:border-gray-300 hover:bg-gray-100 disabled:text-gray-300';
      textColor = 'text-gray-800';
      break;
    case 'no-bg-no-border':
      bgColor = 'bg-transparent';
      textColor = 'text-gray-800';
      border = 'border-transparent';
      break;
  }

  /*
  text-white bg-blue-800 hover:bg-primary-800 focus:ring-4 focus:ring-primary-300 font-medium rounded-lg text-sm px-4 lg:px-5 py-2 lg:py-2.5 mr-2 dark:bg-primary-600 focus:outline-none
  flex items-center justify-center gap-2 rounded-lg border bg-blue-800 hover:bg-blue-700 active:bg-blue-600 text-white px-5 py-2.5 border-transparent cursor-pointer text-sm
  */

  return props.onClick || props.isSubmit ? (
    <button
      className={`flex items-center justify-center gap-2 rounded-lg border ${props.className || ''} ${bgColor} ${textColor} ${padding} ${border} ${
        props.disabled
          ? 'cursor-not-allowed bg-gray-300 border-gray-300 pointer-events-none'
          : 'cursor-pointer'
      } ${props.size === 'xs' ? 'text-xs' : 'text-sm'} ${props.classButton || ''} `}
      onClick={props.onClick}
      disabled={props.disabled}
      type={props.isSubmit ? 'submit' : 'button'}
    >
      {props.icon?.find((icon) => icon.position === 'left')?.icon ||
        props.icon?.find((icon) => icon.position === 'center')?.icon}
      {props.children}
      {props.icon?.find((icon) => icon.position === 'right')?.icon}
    </button>
  ) : (
    <a
      className={`flex items-center justify-center gap-2 rounded-lg border ${bgColor} ${textColor} ${padding} ${border} ${
        props.disabled
          ? 'cursor-not-allowed bg-gray-300 border-gray-300 pointer-events-none'
          : 'cursor-pointer'
      } ${props.size === 'xs' ? 'text-xs' : 'text-sm'}`}
      href={props.href}
      target={props.targetBlank && !props.disabled ? '_blank' : '_self'}
      rel={props.targetBlank ? 'noopener noreferrer' : ''}
      download={props.download ? '' : undefined}
    >
      {props.icon?.find((icon) => icon.position === 'left')?.icon ||
        props.icon?.find((icon) => icon.position === 'center')?.icon}
      {props.children}
      {props.icon?.find((icon) => icon.position === 'right')?.icon}
    </a>
  );
};

export default Button;
