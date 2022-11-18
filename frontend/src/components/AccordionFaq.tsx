export default function AccordionFaq(props: {
  question: string;
  answer: string;
}) {
  return (
    <details className="tw-collapse tw-collapse-plus tw-border tw-border-base-300 tw-bg-base-100">
      <summary
        tabIndex={0}
        className="tw-collapse-title tw-text-xl tw-font-medium"
      >
        {props.question}
      </summary>
      <div className="tw-collapse-content">
        <p dangerouslySetInnerHTML={{ __html: props.answer }}></p>
      </div>
    </details>
  );
}
