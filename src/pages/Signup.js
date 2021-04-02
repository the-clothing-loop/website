import { useState } from "react";
import { useParams, Redirect } from "react-router-dom";
import { useTranslation } from "react-i18next";
import withStyles from "@material-ui/core/styles/withStyles";
import AppIcon from "../images/sfm_logo.png";
import { useForm } from "react-hook-form";
import { withTranslation } from "react-i18next";

// Material UI
import Grid from "@material-ui/core/Grid";
import Typography from "@material-ui/core/Typography";
import TextField from "@material-ui/core/TextField";
import Button from "@material-ui/core/Button";
import Checkbox from "@material-ui/core/Checkbox";
import FormGroup from "@material-ui/core/FormGroup";
import FormControlLabel from "@material-ui/core/FormControlLabel";

import { addUser } from "../util/firebase/user";

const Signup = (props) => {
  const { t } = useTranslation();
  const {chain} = useParams();
  const [submitted, setSubmitted] = useState(false);
  const { register, handleSubmit } = useForm();
  const { classes } = props;

  const onSubmit = (user) => {
    addUser(user);
    setSubmitted(true);
  };

  const formField = (fieldName) => {
    return (
      <TextField
        id={fieldName}
        name={fieldName}
        type="text"
        label={t(fieldName)}
        className={classes.textField}
        inputRef={register}
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
          {formField("email")}
          {formField("phonenumber")}

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
//
