import { useState } from "react";
import { useParams, Redirect } from "react-router-dom";
import { useTranslation } from "react-i18next";
import withStyles from "@material-ui/core/styles/withStyles";
import AppIcon from "../images/sfm_logo.png";
import { useForm } from "react-hook-form";
import { withTranslation } from "react-i18next";
import MuiPhoneInput from "material-ui-phone-number";

// Material UI
import Grid from "@material-ui/core/Grid";
import Typography from "@material-ui/core/Typography";
import TextField from "@material-ui/core/TextField";
import Button from "@material-ui/core/Button";
import Checkbox from "@material-ui/core/Checkbox";
import FormGroup from "@material-ui/core/FormGroup";
import FormControlLabel from "@material-ui/core/FormControlLabel";

import { addUser, validateNewUser } from "../util/firebase/user";

const Signup = (props) => {
  const { t } = useTranslation();
  const { chain } = useParams();
  const [submitted, setSubmitted] = useState(false);
  const { register, handleSubmit } = useForm();
  const { classes } = props;

  const onSubmit = async (user) => {
    addUser(user);
    const userValid = await validateNewUser(user.email);
    console.log(userValid);
    // TODO: do something with validation info for new user (e.g. display this)
    setSubmitted(true);
  };

  const formField = (fieldName, email = false) => {
    return (
      <TextField
        id={fieldName}
        name={fieldName}
        type={email ? "email" : "text"}
        label={t(fieldName)}
        className={classes.textField}
        inputRef={register}
        required={true}
        fullWidth
      ></TextField>
    );
  };

  let signupForm = (
    <Grid container className={classes.form}>
      <Grid item sm />
      <Grid item sm>
        <img
          src={AppIcon}
          alt="SFM logo"
          width="200"
          className={classes.image}
        />
        <Typography variant="h3" className={classes.pageTitle}>
          {t("signup")}
        </Typography>
        <form onSubmit={handleSubmit(onSubmit)}>
          <h1>{chain}</h1>
          {formField("name")}
          {formField("address")}
          {formField("email", true)}
          <MuiPhoneInput
            defaultCountry="nl"
            fullWidth
            label={t("phonenumber")}
            required={true}
          />

          <FormGroup row>
            <FormControlLabel
              control={<Checkbox name="checkedActions" inputRef={register} />}
              label={t("actions")}
            />
            <FormControlLabel
              control={
                <Checkbox name="checkedNewsletter" inputRef={register} />
              }
              label={t("newsletter")}
            />
          </FormGroup>

          <Button
            type="submit"
            variant="contained"
            color="primary"
            className={classes.button}
          >
            {t("signup")}
          </Button>
        </form>
      </Grid>
      <Grid item sm />
    </Grid>
  );

  if (submitted) {
    return <Redirect to="/thankyou" />;
  } else {
    return signupForm;
  }
};

const styles = (theme) => ({
  ...theme.spreadThis,
});

export default withTranslation()(withStyles(styles)(Signup));
