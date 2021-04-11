import { useState } from "react";
import { useParams, Redirect } from "react-router-dom";
import { useTranslation } from "react-i18next";
import withStyles from "@material-ui/core/styles/withStyles";
import AppIcon from "../images/sfm_logo.png";
import { useForm } from "react-hook-form";
import { withTranslation } from "react-i18next";
import NewChainLocation from './NewChainLocation'

// Material UI
import Grid from "@material-ui/core/Grid";
import Typography from "@material-ui/core/Typography";
import Button from "@material-ui/core/Button";
import Checkbox from "@material-ui/core/Checkbox";
import FormGroup from "@material-ui/core/FormGroup";
import FormControlLabel from "@material-ui/core/FormControlLabel";

import { addUser } from "../util/firebase/user";
import TextField from "../components/TextField";

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
          {t("startNewChain")}
        </Typography>
        <form onSubmit={handleSubmit(onSubmit)}>
          <h1>{chain}</h1>
          <TextField fieldName="name" inputRef={register} />
          <TextField fieldName="address" inputRef={register} />
          <TextField fieldName="email" inputRef={register} email={true} />
          <TextField fieldName="phonenumber" inputRef={register} />

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
            {t("next")}
          </Button>
        </form>
      </Grid>
      <Grid item sm />
    </Grid>
  );

  if (submitted) {
    return <NewChainLocation />;
  } else {
    return signupForm;
  }
};

const styles = (theme) => ({
  ...theme.spreadThis,
});

export default withTranslation()(withStyles(styles)(Signup));
