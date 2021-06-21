// React / plugins
import { useState, useEffect } from "react";
import { Redirect, useLocation } from "react-router-dom";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";

// Material UI
import Typography from "@material-ui/core/Typography";
import Button from "@material-ui/core/Button";
import Checkbox from "@material-ui/core/Checkbox";
import FormGroup from "@material-ui/core/FormGroup";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import { makeStyles } from "@material-ui/core";
import theme from "../util/theme";
import ThreeColumnLayout from "../components/ThreeColumnLayout";

// Project resources
import AppIcon from "../images/sfm_logo.png";
import { createUser, validateNewUser } from "../util/firebase/user";
import { TextFormField, PhoneFormField } from "../components/FormFields";
import GeocoderSelector from "../components/GeocoderSelector";
import { getChain } from "../util/firebase/chain";

const Signup = () => {
  const { t } = useTranslation();
  const [submitted, setSubmitted] = useState(false);
  const [chain, setChain] = useState({});
  const [geocoderResult, setGeocoderResult] = useState({});
  const { register, handleSubmit } = useForm();
  const location = useLocation();
  const classes = makeStyles(theme)();
  
  // Get chain id from the URL and save to state
  useEffect(async () => {
    if (location.state && location.state.chainId) {
      const chain = await getChain(location.state.chainId)
      setChain(chain);
    }
  }, [location]);

  // Gather data from form, validate and send to firebase
  const onSubmit = async (formData) => {
    // TODO: allow only full addresses
    let user = {
      ...formData,
      address: geocoderResult.result.place_name,
      chainId: chain.id,
    };
    console.log(user);
    // TODO: do something with validation info for new user (e.g. display this)
    await createUser(user);
    setSubmitted(true);
  };

  let signupForm = (
    <ThreeColumnLayout>
      <img src={AppIcon} alt="SFM logo" width="200" className={classes.image} />
      <Typography variant="h3" className={classes.pageTitle}>
        {t("signup")}
      </Typography>
      <p>{chain.name}</p>
      <form onSubmit={handleSubmit(onSubmit)}>
        <TextFormField name="name" inputRef={register} />
        <TextFormField name="email" inputRef={register} />
        <PhoneFormField inputRef={register} />
        <GeocoderSelector onResult={setGeocoderResult} />
        <div>
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
        </div>

        <Button
          type="submit"
          variant="contained"
          color="primary"
          className={classes.button}
        >
          {t("signup")}
        </Button>
      </form>
    </ThreeColumnLayout>
  );

  if (submitted) {
    return <Redirect to={"/thankyou"} />;
  } else {
    return signupForm;
  }
};

export default Signup;
