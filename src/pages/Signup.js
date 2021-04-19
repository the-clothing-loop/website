import React, { useState } from "react";
import { useParams, Redirect } from "react-router-dom";
import { useTranslation } from "react-i18next";
import withStyles from "@material-ui/core/styles/withStyles";
import AppIcon from "../images/sfm_logo.png";
import { useForm } from "react-hook-form";
import { withTranslation } from "react-i18next";
import MuiPhoneInput from "material-ui-phone-number";
import Geocoder from "react-mapbox-gl-geocoder";

// Material UI
import Grid from "@material-ui/core/Grid";
import Typography from "@material-ui/core/Typography";
import Button from "@material-ui/core/Button";
import Checkbox from "@material-ui/core/Checkbox";
import FormGroup from "@material-ui/core/FormGroup";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import { FilledInput } from "@material-ui/core";

import { addUser, validateNewUser } from "../util/firebase/user";
import TextField from "../components/TextField";

const mapAccess = {
  mapboxApiAccessToken: process.env.REACT_APP_MAPBOX_KEY,
};
const Signup = (props) => {
  const { t } = useTranslation();
  const { chain } = useParams();
  const [submitted, setSubmitted] = useState(false);
  const { register, handleSubmit } = useForm();
  const { classes } = props;
  const [state, setState] = useState({
    viewport: {},
    visible: false,
  });
  const [address, setAddress] = useState([]);

  const onSubmit = async (user) => {
    addUser(user);
    const userValid = await validateNewUser(user.email);
    console.log(userValid);
    // TODO: do something with validation info for new user (e.g. display this)
    setSubmitted(true);
  };

  const onSelected = (viewport, item) => {
    setState({
      viewport: viewport,
      visible: true,
    });
    console.log(item);
    setAddress({
      name: item.text,
      details: item.context,
    });
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
          <TextField fieldName="name" inputRef={register} />
          {/* <TextField fieldName="address" inputRef={register} /> */}
          <TextField fieldName="email" inputRef={register} email={true} />

          <p>{"search for address:"}</p>
          <Geocoder
            {...mapAccess}
            onSelected={onSelected}
            viewport={state.viewport}
            hideOnSelect={true}
          />

          {state.visible ? (
            <div>
              <FilledInput
                fieldName={"address"}
                label={t("address")}
                value={t(address.name)}
                id={"addressName"}
                name={"addressName"}
                type={"text"}
                className={"addressName"}
                inputRef={register}
                fullWidth
              ></FilledInput>
              {address.details.map((el) => {
                return (
                  <FilledInput
                    helperText
                    fieldName={el.id.split(".")[0]}
                    label={t(el.id.split(".")[0])}
                    value={t(el.text)}
                    id={el.text}
                    name={"addressName"}
                    type={"text"}
                    className={"addressDetails"}
                    inputRef={register}
                  ></FilledInput>
                );
              })}
            </div>
          ) : null}
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
