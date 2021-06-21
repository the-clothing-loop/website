import TextField from "@material-ui/core/TextField";
import { makeStyles } from "@material-ui/core/styles";
import theme from "../util/theme";
import { useTranslation } from "react-i18next";
import MuiPhoneInput from "material-ui-phone-number";
import { useState } from "react";

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

const PhoneFormField = (props) => {
  const { t } = useTranslation();

  const handleChange = (e) => {
    props.onChange(e);
  };

  return (
    <MuiPhoneInput
      defaultCountry="nl"
      regions={"europe"}
      fullWidth
      label={t("phoneNumber")}
      required={true}
      name="phoneNumber"
      onChange={handleChange}
      phoneNumber={props.value}
    />
  );
};
export { TextFormField, PhoneFormField };
