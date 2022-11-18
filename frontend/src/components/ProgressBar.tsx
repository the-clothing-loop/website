import { useTranslation } from "react-i18next";

const steps = ["signup", "selectLoopLocation", "confirmation"];

interface Props {
  activeStep: number;
}

export default function ProgressBar({ activeStep }: Props) {
  const { t } = useTranslation();

  return (
    <ul className="tw-steps">
      {steps.map((step, i) => (
        <li
          className={`tw-step ${activeStep === i ? "tw-step-secondary" : ""}`}
        >
          {t(step)}
        </li>
      ))}
    </ul>
  );
}
