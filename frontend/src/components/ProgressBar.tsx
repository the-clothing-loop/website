import { useTranslation } from "react-i18next";

const steps = ["signup", "selectLoopLocation", "confirmation"];

interface Props {
  activeStep: number;
}

export default function ProgressBar({ activeStep }: Props) {
  const { t } = useTranslation();

  return (
    <ul className="steps text-sm">
      {steps.map((step, i) => (
        <li className={`step ${activeStep >= i ? "step-secondary" : ""}`}>
          {t(step)}
        </li>
      ))}
    </ul>
  );
}
