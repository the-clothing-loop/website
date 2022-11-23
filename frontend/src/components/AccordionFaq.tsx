export default function AccordionFaq(props: {
  question: string;
  answer: string;
}) {
  return (
    <details className="collapse collapse-plus border border-base-300 bg-base-100">
      <summary tabIndex={0} className="collapse-title text-xl font-medium">
        {props.question}
      </summary>
      <div className="collapse-content">
        <p dangerouslySetInnerHTML={{ __html: props.answer }}></p>
      </div>
    </details>
  );
}
