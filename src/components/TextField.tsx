import React from "react";
import TextField from "@material-ui/core/TextField";
import withStyles from "@material-ui/core/styles/withStyles";
import { useTranslation } from 'react-i18next';

const styles = (theme: any) => ({
  ...theme.spreadThis,
});

interface ITextFieldProps {
  classes: any,
  fieldName: string,
  inputRef: any,
  email: boolean,
}

const StyledTextField = ({ classes, fieldName, inputRef, email } : ITextFieldProps) => {
  const { t } = useTranslation();

  return (
    <TextField
      id={fieldName}
      name={fieldName}
      type={email ? "email" : "text"}
      label={t(fieldName)}
      className={classes.textField}
      inputRef={inputRef}
      required={true}
      fullWidth
    ></TextField>
  );
};

export default withStyles(styles)(StyledTextField);
