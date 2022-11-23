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
    <div className={`form-control ${props.classes?.root || "w-full max-w-xs"}`}>
      <label className="label">
        <span className="label-text">{t("phoneNumber")}</span>
      </label>
      <input
        type="phone"
        name="phone"
        aria-invalid={!!invalid}
        onBlur={onBlur}
        className={`input input-bordered w-full ${
          invalid ? "input-error" : "input-secondary"
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
      className={`form-control relative ${classes?.root || "w-full max-w-xs"}`}
    >
      <label className="label">
        <span className="label-text">{label}</span>
      </label>
      <input
        aria-invalid={invalid}
        className={`input input-bordered input-secondary w-full ${
          invalid ? "input-error" : ""
        }`}
        {...props}
      />
      {!!info && (
        <PopoverOnHover message={info} className="absolute top-0 -right-2" />
      )}
    </div>
  );
}
