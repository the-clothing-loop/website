import {
  useState,
  FocusEvent,
  HTMLInputTypeAttribute,
  InputHTMLAttributes,
  ChangeEvent,
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
  required?: boolean;
  value?: string;
  onChange?: (e: ChangeEvent<HTMLInputElement>) => void;
}
export function PhoneFormField(props: PhoneFormFieldProps) {
  const { t } = useTranslation();

  const [valid, setValid] = useState(true);

  function onBlur(e: FocusEvent<HTMLInputElement>) {
    let v = phoneRegExp.test(e.target.value);
    console.log(e.target.value, v);

    setValid(v);
  }

  return (
    <label className={`form-control w-full ${props.classes?.root}`}>
      <div className="label">
        <span className="label-text">
          {t("phoneNumber")}
          {props.required ? "*" : ""}
        </span>
      </div>
      <input
        type="phone"
        name="phone"
        aria-invalid={!valid}
        onBlur={onBlur}
        onChange={props.onChange}
        className={`input input-bordered w-full ${
          valid
            ? "input-secondary"
            : props.required
            ? "input-error"
            : "input-warning"
        }`}
        required={props.required}
      />
    </label>
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
    <label className={`form-control relative w-full ${classes?.root}`}>
      <div className="label">
        <span className="label-text">{label}</span>
      </div>
      {!!info && (
        <PopoverOnHover
          message={info}
          className="absolute top-0 -right-2 tooltip-left"
        />
      )}
      <input
        aria-invalid={invalid}
        className={`input input-bordered input-secondary w-full ${
          invalid ? "input-error" : ""
        }`}
        {...props}
      />
    </label>
  );
}
