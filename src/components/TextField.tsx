import TextField from "@material-ui/core/TextField";
import { makeStyles } from '@material-ui/core/styles';
import theme from "../util/theme"
import { useTranslation } from 'react-i18next';

interface ITextFieldProps {
  fieldName: string,
  inputRef: any,
  email: boolean,
}

const StyledTextField = ({ fieldName, inputRef, email} : ITextFieldProps) => {
  const { t } = useTranslation();
  const classes = makeStyles(theme.form as any)();

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

export default StyledTextField;
