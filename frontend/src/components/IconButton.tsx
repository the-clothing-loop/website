import { Trans, useTranslation } from "react-i18next";
import { string } from "yargs";
interface buttonProps {
  onClick: () => void;
}
export function IconButton(props: buttonProps) {
  const { t } = useTranslation();
  return (
    <button
      type="button"
      className="hover:bg-grey/[.35] text-grey active:text-black"
      onClick={props.onClick}
      aria-label={t("sort")}
    >
      <div className="feather feather-chevron-up"></div>
      <div className="feather feather-chevron-down"></div>
    </button>
  );
}

export function DummyButton() {
  return (
    <button type="button" className="invisible">
      <div className="feather feather-chevron-up "></div>
      <div className="feather feather-chevron-down"></div>
    </button>
  );
}
