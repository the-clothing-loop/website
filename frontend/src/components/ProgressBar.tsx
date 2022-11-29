import { useTranslation } from "react-i18next";

const steps = ["signup", "selectLoopLocation", "confirmation"];

interface Props {
  activeStep: number;
  disabledStep?: number;
}

export default function ProgressBar({ activeStep, disabledStep }: Props) {
  const { t } = useTranslation();

  function stepClass(
    i: number,
    activeStep: number,
    disabledStep: number
  ): string {
    if (disabledStep >= i) {
      return "";
    } else if (activeStep >= i) {
      return "step-secondary";
    } else {
      return "";
    }
  }

  return (
    <ul className="steps text-sm">
      {steps.map((step, i) => {
        return (
          <li
            className={`step ${stepClass(
              i,
              activeStep,
              disabledStep === undefined ? -1 : disabledStep
            )}`}
          >
            {t(step)}
          </li>
        );
      })}
    </ul>
  );
}
