import { TextField, Checkbox, Select, InputLabel, FormHelperText } from "@material-ui/core"
import { makeStyles } from "@material-ui/core/styles";
import theme from "../util/theme";
import i18n from "../i18n";
import { useTranslation } from "react-i18next";
import MuiPhoneInput from "material-ui-phone-number";
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
        className={classes.textField}
      ></MuiPhoneInput>
    </div>
  );
};

const TextForm = ({ label, ...props }) => {
  const [field] = useField(props);
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

const NumberField = ({ label, step=1, ...props}) => {
  const [field] = useField(props);
  const { t } = useTranslation();

  return (
    <div>
      <TextField
        {...field}
        {...props}
        autoComplete="off"
        label={t(label)}
        fullWidth
        type="number"
        inputProps={{
          inputMode: 'numeric',
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
      />
    </FormGroup>
  );
};

const TextArea = ({ label, ...props }) => {
  const [field] = useField(props);
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

const SelectField = ({ label, children, errorText = "", ...props}) => {
  const [field] = useField(props);
  const { t } = useTranslation();
  const labelId = props.name + "Label";
  return (
    <>
      <InputLabel id={labelId}>
        {t(label) + (props?.required ? " *" : "")}
      </InputLabel>
      <Select
        labelId={labelId}
        {...props}
        {...field}
      >
        {children}
      </Select>
      {errorText ? (
        <FormHelperText error={true}>{errorText}</FormHelperText>
      ) : null}
    </>
  )
}

export { TextFormField, PhoneFormField, TextForm, CheckboxField, TextArea, NumberField, SelectField};
