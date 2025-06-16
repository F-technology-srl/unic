export interface StepperProps {
  number: number;
  label: string;
  state: 'disabled' | 'active' | 'completed';
  onClick?: () => void;
}

export const Stepper = (props: StepperProps) => {
  return (
    <div
      className={`flex items-center space-x-2.5 rtl:space-x-reverse ${props.state === 'disabled' ? 'pointer-events-none cursor-default' : 'cursor-pointer'}`}
      onClick={props.state === 'disabled' ? () => null : props.onClick}
    >
      <span
        className={`flex items-center justify-center w-8 h-8 border ${props.state === 'disabled' ? 'border-gray-400 text-gray-400' : props.state === 'completed' ? 'bg-blue-800 border-blue-800 text-white' : 'border-blue-800 text-blue-800'} rounded-full shrink-0`}
      >
        {props.number}
      </span>
      <span
        className={`leading-none text-xl font-semibold ${props.state === 'disabled' ? 'text-gray-400' : ' text-blue-800'}`}
      >
        {props.label}
      </span>
    </div>
  );
};

export default Stepper;
