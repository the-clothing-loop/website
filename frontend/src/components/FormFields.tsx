import {
  useState,
  FocusEvent,
  HTMLInputTypeAttribute,
  InputHTMLAttributes,
} from "react";
import { useTranslation } from "react-i18next";
import PopoverOnHover from "./Popover";

interface ClassesObj {
  root?: string;
  label?: string;
  input?: string;
}

const phoneRegExp = /^\+?\(?[0-9]{1,3}\)?[-\s\./0-9]+$/g;

interface PhoneFormFieldProps {
  classes?: {
    root?: string;
  };
}
export function PhoneFormField(props: PhoneFormFieldProps) {
  const { t } = useTranslation();

  const [invalid, setInvalid] = useState(true);

  function onBlur(e: FocusEvent<HTMLInputElement>) {
    console.log(e.target.value, phoneRegExp.test(e.target.value));

    setInvalid(!phoneRegExp.test(e.target.value));
  }

  return (
    <div
      className={`tw-form-control ${
        props.classes?.root || "tw-w-full tw-max-w-xs"
      }`}
    >
      <label className="tw-label">
        <span className="tw-label-text">{t("phoneNumber")}</span>
      </label>
      <input
        type="phone"
        name="phone"
        aria-invalid={!!invalid}
        onBlur={onBlur}
        className={`tw-input tw-input-bordered tw-w-full ${
          invalid ? "tw-input-error" : "tw-input-secondary"
        }`}
      />
    </div>
  );
}

interface TextFormProps {
  label: string;
  classes?: {
    root?: string;
  };
  info?: string;
  type: HTMLInputTypeAttribute;
  name: string;
  invalid?: boolean;
  onBlur?: (e: FocusEvent<HTMLInputElement>) => void;
}
export function TextForm({
  label,
  invalid,
  info,
  classes,
  ...props
}: TextFormProps & InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div
      className={`tw-form-control tw-relative ${
        classes?.root || "tw-w-full tw-max-w-xs"
      }`}
    >
      <label className="tw-label">
        <span className="tw-label-text">{label}</span>
      </label>
      <input
        aria-invalid={invalid}
        className={`tw-input tw-input-bordered tw-input-secondary tw-w-full ${
          invalid ? "tw-input-error" : ""
        }`}
        {...props}
      />
      {!!info && (
        <PopoverOnHover
          message={info}
          className="tw-absolute tw-top-0 -tw-right-2"
        />
      )}
    </div>
  );
}
