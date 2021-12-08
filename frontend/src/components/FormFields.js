import TextField from "@material-ui/core/TextField";
import { makeStyles } from "@material-ui/core/styles";
import theme from "../util/theme";
import { useTranslation } from "react-i18next";
import MuiPhoneInput from "material-ui-phone-number";
import Checkbox from "@material-ui/core/Checkbox";
import { useField } from "formik";
import FormGroup from "@material-ui/core/FormGroup";
import FormControlLabel from "@material-ui/core/FormControlLabel";

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
      fullWidth
    ></TextField>
  );
};

const PhoneFormField = ({ label, ...props }) => {
  const { t } = useTranslation();

  const [field, meta] = useField(props);
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
      ></MuiPhoneInput>
    </div>
  );
};

const TextForm = ({ label, ...props }) => {
  const [field, meta] = useField(props);
  const { t } = useTranslation();

  return (
    <div>
      <TextField
        {...field}
        {...props}
        autoComplete="off"
        label={t(label)}
        fullWidth
      />
    </div>
  );
};

const CheckboxField = ({ required, label, ...props }) => {
  const [field, meta] = useField(props);
  const { t } = useTranslation();
  const classes = makeStyles(theme)();
  return (
    <FormGroup >
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
      />
    </FormGroup>
  );
};

const TextArea = ({ label, ...props }) => {
  const [field, meta] = useField(props);
  return (
    <TextField
      id="outlined-multiline-static"
      multiline
      rows={4}
      variant="outlined"
      {...props}
      {...field}
      label={label}
    />
  );
};

export { TextFormField, PhoneFormField, TextForm, CheckboxField, TextArea };
