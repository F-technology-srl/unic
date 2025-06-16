export interface TextProps {
  className?: string;
  id?: string;
}

export const H3 = (props: React.PropsWithChildren<TextProps>) => {
  return (
    <span
      className={`text-xl font-semibold leading-none ${props.className || ''}`}
    >
      {props.children}
    </span>
  );
};

export const BodyTextContent = (props: React.PropsWithChildren<TextProps>) => {
  return (
    <span
      id={props.id}
      className={`text-base font-normal ${props.className || ''}`}
    >
      {props.children}
    </span>
  );
};
