export function setWordInBold(props: {
  full_text?: string;
  offset?: number;
  offsetLength?: number;
}) {
  if (!props.offset || !props.offsetLength) {
    return props.full_text;
  }
  const parteIniziale = props.full_text?.substring(0, props.offset) ?? '';
  const parolaBold =
    `<strong>${props.full_text?.substring(props.offset ?? 0, (props.offset ?? 0) + (props.offsetLength ?? 0))}</strong>` ??
    '';
  const parteFinale =
    props.full_text?.substring(
      (props.offset ?? 0) + (props.offsetLength ?? 0),
    ) ?? '';
  const rowWithBoldText = parteIniziale + parolaBold + parteFinale;
  return rowWithBoldText;
}
