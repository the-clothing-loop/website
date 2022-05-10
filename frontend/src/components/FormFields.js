import {
  TextField,
  Checkbox,
  Select,
  InputLabel,
  FormHelperText,
  FormGroup,
  FormControlLabel,
} from "@mui/material";
import { makeStyles } from "@mui/styles";

import { useTranslation } from "react-i18next";
import MuiPhoneInput from "material-ui-phone-number";
import { useField } from "formik";

import theme from "../util/theme";
import i18n from "../i18n";

const TextFormField = ({ name, inputRef, email }) => {
  const { t } = useTranslation();
  const classes = makeStyles(theme)();

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

const PhoneFormField = ({ label, ...props }) => {
  const { t } = useTranslation();
  const classes = makeStyles(theme)();

  const [field] = useField(props);
  return (
    <div>
      <MuiPhoneInput
        defaultCountry="nl"
        regions={"europe"}
        fullWidth
        label={t("phoneNumber")}
        required={true}
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

const TextForm = ({ label, ...props }) => {
  const [field] = useField(props);
  const { t } = useTranslation();
  const classes = makeStyles(theme)();

  return (
    <TextField
      {...field}
      {...props}
      autoComplete="off"
      label={t(label)}
      fullWidth
      InputLabelProps={{
        className: classes.inputLabel,
      }}
      variant="standard"
    />
  );
};

const NumberField = ({ label, step = 1, ...props }) => {
  const [field] = useField(props);
  const { t } = useTranslation();
  const classes = makeStyles(theme)();

  return (
    <div>
      <TextField
        {...field}
        {...props}
        autoComplete="off"
        label={t(label)}
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

const CheckboxField = ({ required, label, ...props }) => {
  const [field] = useField(props);
  const classes = makeStyles(theme)();
  return (
    <FormGroup>
      <FormControlLabel
        control={
          <Checkbox
            required={required ? true : false}
            name={field.name}
            className={classes.checkbox}
          />
        }
        {...field}
        {...props}
        label={label}
        required={required ? true : false}
        InputLabelProps={{
          className: classes.inputLabel,
        }}
      />
    </FormGroup>
  );
};

const TextArea = ({ label, ...props }) => {
  const [field] = useField(props);
  const classes = makeStyles(theme)();
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

const SelectField = ({ label, children, errorText = "", ...props }) => {
  const [field] = useField(props);
  const { t } = useTranslation();
  const classes = makeStyles(theme)();
  const labelId = props.name + "Label";
  return (
    <>
      <InputLabel id={labelId} className={classes.inputLabel}>
        {t(label) + (props?.required ? " *" : "")}
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
