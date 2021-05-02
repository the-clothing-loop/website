import TextField from "@material-ui/core/TextField";
import { makeStyles } from "@material-ui/core/styles";
import theme from "../util/theme";
import { useTranslation } from "react-i18next";
import MuiPhoneInput from "material-ui-phone-number";

const TextFormField = ({ name, inputRef, email }) => {
  const { t } = useTranslation();
  const classes = makeStyles(theme)();

  return (
    <TextField
      id={name}
      name={name}
      type={email ? "email" : "text"}
      label={t(name)}
      className={classes.textField}
      inputRef={inputRef}
      required={true}
      fullWidth
    ></TextField>
  );
};

const PhoneFormField = ({ inputRef }) => {
  const { t } = useTranslation();
  return (
    <MuiPhoneInput
      defaultCountry="nl"
      fullWidth
      label={t("phoneNumber")}
      required={true}
      name="phoneNumber"
      inputRef={inputRef}
    />
  );
};
export { TextFormField , PhoneFormField};
