import {
  TextField,
  Checkbox,
  Select,
  InputLabel,
  FormHelperText,
  FormGroup,
  FormControlLabel,
  TextFieldProps,
  FormControlLabelProps,
  SelectProps,
} from "@mui/material";
import { makeStyles } from "@mui/styles";

import { useTranslation } from "react-i18next";
import MuiPhoneInput, { MuiPhoneNumberProps } from "material-ui-phone-number";
import { useField } from "formik";

import theme from "../util/theme";
import i18n from "../i18n";
import { ReactJSXElement } from "@emotion/react/types/jsx-namespace";

interface TextFormFieldProps {
  name: string;
  inputRef: React.Ref<HTMLInputElement>;
  email: string;
}

const TextFormField = ({ name, inputRef, email }: TextFormFieldProps) => {
  const { t } = useTranslation();
  const classes = makeStyles(theme as any)();

  return (
    <TextField
      id={name}
      name={name}
      type={email ? "email" : "text"}
      label={t("name")}
      className={classes.textField}
      inputRef={inputRef}
      required={true}
      variant="standard"
      fullWidth
    ></TextField>
  );
};

const PhoneFormField = ({ label, ...props }: MuiPhoneNumberProps) => {
  const { t } = useTranslation();
  const classes = makeStyles(theme as any)();

  const [field] = useField(props as any);
  return (
    <div>
      <MuiPhoneInput
        defaultCountry="nl"
        regions={"europe"}
        fullWidth
        label={t("phoneNumber")}
        required={true}
        //@ts-ignore
        htmlFor={field.name}
        {...field}
        {...props}
        inputClass={classes.textField}
        InputLabelProps={{
          className: classes.inputLabel,
        }}
      ></MuiPhoneInput>
    </div>
  );
};

const TextForm = ({ label, ...props }: TextFieldProps) => {
  const [field] = useField(props as any);
  const { t } = useTranslation();
  const classes = makeStyles(theme as any)();

  return (
    <TextField
      {...field}
      {...props}
      autoComplete="off"
      label={label}
      fullWidth
      InputLabelProps={{
        className: classes.inputLabel,
      }}
      variant="standard"
    />
  );
};

type NumberFieldProps = TextFieldProps & { step: number };
const NumberField = ({ label, step = 1, ...props }: NumberFieldProps) => {
  const [field] = useField(props as any);
  const { t } = useTranslation();
  const classes = makeStyles(theme as any)();

  return (
    <div>
      <TextField
        {...field}
        {...props}
        autoComplete="off"
        label={label}
        variant="standard"
        fullWidth
        type="number"
        InputLabelProps={{
          className: classes.inputLabel,
        }}
        inputProps={{
          inputMode: "numeric",
          step: step,
          /* Determines use of . or , for decimal separator
           * Firefox respects "lang" but other browsers use
           * their configured locale */
          lang: i18n.language,
        }}
      />
    </div>
  );
};

type CheckboxFieldProps = React.LabelHTMLAttributes<any> &
  Partial<FormControlLabelProps> & {
    required?: boolean;
    name: string;
  };
const CheckboxField = ({ required, label, ...props }: CheckboxFieldProps) => {
  const [field] = useField(props as any);
  const classes = makeStyles(theme as any)();
  return (
    <FormGroup>
      <FormControlLabel
        control={
          <Checkbox required={!!required} name={field.name} color="secondary" />
        }
        {...field}
        {...props}
        label={label}
      />
    </FormGroup>
  );
};

const TextArea = ({ label, ...props }: TextFieldProps) => {
  const [field] = useField(props as any);
  const classes = makeStyles(theme as any)();
  return (
    <TextField
      id="outlined-multiline-static"
      multiline
      rows={4}
      variant="outlined"
      {...props}
      {...field}
      label={label}
      InputLabelProps={{
        className: classes.inputLabel,
      }}
    />
  );
};

type SelectFieldProps = {
  label?: string;
  children: ReactJSXElement;
  errorText?: string;
} & SelectProps;
const SelectField = ({
  label,
  children,
  errorText = "",
  ...props
}: SelectFieldProps) => {
  const [field] = useField(props as any);
  const { t } = useTranslation();
  const classes = makeStyles(theme as any)();
  const labelId = props.name + "Label";
  return (
    <>
      <InputLabel id={labelId} className={classes.inputLabel}>
        {label + (props?.required ? " *" : "")}
      </InputLabel>
      <Select labelId={labelId} {...props} {...field}>
        {children}
      </Select>
      {errorText ? (
        <FormHelperText error={true}>{errorText}</FormHelperText>
      ) : null}
    </>
  );
};

export {
  TextFormField,
  PhoneFormField,
  TextForm,
  CheckboxField,
  TextArea,
  NumberField,
  SelectField,
};
