import {
  useState,
  FocusEvent,
  HTMLInputTypeAttribute,
  InputHTMLAttributes,
} from "react";
import { useTranslation } from "react-i18next";

const phoneRegExp = /^\+?\(?[0-9]{1,3}\)?[-\s\./0-9]+$/g;

export function PhoneFormField(props: { className?: string }) {
  const { t } = useTranslation();

  const [invalid, setInvalid] = useState(true);

  function onBlur(e: FocusEvent<HTMLInputElement>) {
    setInvalid(phoneRegExp.test(e.target.value));
  }

  return (
    <div
      className={`tw-form-control ${
        props.className || "tw-w-full tw-max-w-xs"
      }`}
    >
      <label className="tw-label">
        <span className="tw-label-text">{t("phone")}</span>
      </label>
      <input
        type="phone"
        name="phone"
        aria-invalid={!!invalid}
        onBlur={onBlur}
        className={`tw-input tw-input-bordered tw-w-full ${
          invalid ? "tw-input-error" : ""
        }`}
      />
    </div>
  );
}

interface TextFormProps {
  label: string;
  className?: string;
  type: HTMLInputTypeAttribute;
  name: string;
  invalid?: boolean;
  onBlur?: (e: FocusEvent<HTMLInputElement>) => void;
}
export function TextForm({
  label,
  invalid,
  className,
  ...props
}: TextFormProps & InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className={`tw-form-control ${className || "tw-w-full tw-max-w-xs"}`}>
      <label className="tw-label">
        <span className="tw-label-text">{label}</span>
      </label>
      <input
        aria-invalid={invalid}
        className={`tw-input tw-input-bordered tw-w-full ${
          invalid ? "tw-input-error" : ""
        }`}
        {...props}
      />
    </div>
  );
}
