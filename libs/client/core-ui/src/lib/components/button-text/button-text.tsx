import React from 'react';

export interface ButtonTextProps {
  onClick?: () => void;
  link?: {
    url: string;
    target?: string;
  };
  icon?: JSX.Element;
  className?: string;
}

export const ButtonText = (props: React.PropsWithChildren<ButtonTextProps>) => {
  return props.onClick ? (
    <span
      onClick={props.onClick}
      className="inline-flex items-center gap-2 text-blue-800 hover:text-blue-500 cursor-pointer"
    >
      {props.children}
      {props.icon
        ? React.cloneElement(props.icon, {
            currentColor: true,
          })
        : null}
    </span>
  ) : (
    <a
      href={props.link?.url}
      target={props.link?.target}
      className={` ${
        props.className
          ? props.className
          : 'inline-flex items-center gap-2 text-blue-800 hover:text-blue-500'
      }`}
    >
      {props.children}
      {props.icon
        ? React.cloneElement(props.icon, {
            currentColor: true,
          })
        : null}
    </a>
  );
};
