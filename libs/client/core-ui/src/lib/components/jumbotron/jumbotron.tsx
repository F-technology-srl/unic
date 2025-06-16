export interface JumbotronProps {
  title: string;
  description: string;
}

export const Jumbotron = (props: JumbotronProps) => {
  return (
    <div className="flex flex-col items-center gap-5 py-14 px-4">
      <h1 className="text-6xl leading-none font-extrabold text-gray-800">
        {props.title}
      </h1>
      <p className="text-lg font-semibold text-gray-800">{props.description}</p>
    </div>
  );
};

export default Jumbotron;
