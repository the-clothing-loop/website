import {
  useState,
  FocusEvent,
  HTMLInputTypeAttribute,
  InputHTMLAttributes,
  useEffect,
} from "react";
import { useTranslation } from "react-i18next";
import PopoverOnHover from "./Popover";
import PhoneInput, { isValidPhoneNumber } from "react-phone-number-input/max";
import Cookies from "js-cookie";
import "react-phone-number-input/style.css";
import { ipinfoGet } from "../api/ipinfo";

const IPINFO_KEY = import.meta.env.VITE_IPINFO_API_KEY;
const COOKIE_IPINFO_COUNTRY = "ipinfo_country";

interface PhoneFormFieldProps {
  classes?: {
    root?: string;
  };
  required?: boolean;
  value: string;
  onChange: (e: string) => void;
}
export function PhoneFormField(props: PhoneFormFieldProps) {
  const { t } = useTranslation();

  const [valid, setValid] = useState(true);
  const [defaultCountry, setDefaultCountry] = useState(
    () => Cookies.get(COOKIE_IPINFO_COUNTRY) || ""
  );
  useEffect(() => {
    if (defaultCountry) return;

    ipinfoGet(IPINFO_KEY)
      .then((res) => {
        return res.data.country;
      })
      .catch((err) => {
        return "NL";
      })
      .then((res) => {
        Cookies.set(COOKIE_IPINFO_COUNTRY, res, { expires: 365 });
        setDefaultCountry(res);
      });
  }, []);

  function onBlur(e: FocusEvent<HTMLInputElement>) {
    let v = isValidPhoneNumber(e.target.value);
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
      <PhoneInput
        international
        defaultCountry={defaultCountry as any}
        value={props.value}
        onChange={props.onChange as any}
        onBlur={onBlur}
        type="phone"
        name="phone"
        aria-invalid={!valid}
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
    <div
      className={"form-control relative w-full ".concat(classes?.root || "")}
    >
      {!!info && (
        <PopoverOnHover
          message={info}
          className="absolute top-0 -right-2 rtl:right-auto rtl:-left-2 tooltip-left rtl:tooltip-right"
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
