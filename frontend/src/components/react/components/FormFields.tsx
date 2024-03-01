import {
  useState,
  type FocusEvent,
  type HTMLInputTypeAttribute,
  type InputHTMLAttributes,
} from "react";

import PopoverOnHover from "./Popover";
import PhoneInput, { isValidPhoneNumber } from "react-phone-number-input/max";
import "react-phone-number-input/style.css";
import { useTranslation } from "react-i18next";

interface PhoneFormFieldProps {
  classes?: {
    root?: string;
  };
  required?: boolean;
  value: string;
  onChange: (e: string) => void;
}
export function PhoneFormField({
  classes,
  required,
  value,
  onChange,
  ...props
}: PhoneFormFieldProps &
  Omit<InputHTMLAttributes<HTMLInputElement>, "onChange">) {
  const { t } = useTranslation();

  const [valid, setValid] = useState(true);

  function onBlur(e: FocusEvent<HTMLInputElement>) {
    let v = isValidPhoneNumber(e.target.value);
    console.log(e.target.value, v);

    setValid(v);
  }

  return (
    <label className={`form-control w-full ${classes?.root}`}>
      <div className="label">
        <span className="label-text">
          {t("phoneNumber")}
          {required ? "*" : ""}
        </span>
      </div>
      <PhoneInput
        international
        value={value}
        onChange={onChange as any}
        onBlur={onBlur}
        type="phone"
        name="phone"
        aria-invalid={!valid}
        className={`input input-bordered w-full ${
          valid ? "input-secondary" : required ? "input-error" : "input-warning"
        }`}
        required={required}
        {...props}
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
    <div
      className={"form-control relative w-full ".concat(classes?.root || "")}
    >
      {!!info && (
        <PopoverOnHover
          message={info}
          className="absolute top-0 -right-2 rtl:right-auto rtl:-left-2 tooltip-left"
        />
      )}
      <label>
        <div className="label">
          <span className="label-text">{label}</span>
        </div>
        <input
          aria-invalid={invalid}
          className={`input input-bordered input-secondary w-full ${
            invalid ? "input-error" : ""
          }`}
          {...props}
        />
      </label>
    </div>
  );
}
