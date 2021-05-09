// React / plugins
import { useState } from "react";
import { Redirect } from "react-router-dom";
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
import { TextFormField, PhoneFormField } from "../components/FormFields";
import GeocoderSelector from "../components/GeocoderSelector";
import AppIcon from "../images/sfm_logo.png";

const Signup = () => {
  const { t } = useTranslation();
  const [submitted, setSubmitted] = useState(false);
  const [geocoderResult, setGeocoderResult] = useState({});
  const { register, handleSubmit } = useForm();
  const classes = makeStyles(theme)();

  const onSubmit = () => {
    setSubmitted(true);
  };

  let signupForm = (
    <ThreeColumnLayout>
      <img src={AppIcon} alt="SFM logo" width="200" className={classes.image} />
      <Typography variant="h3" className={classes.pageTitle}>
        {t("signup")}
      </Typography>
      <form onSubmit={handleSubmit(onSubmit)}>
        <TextFormField name="name" inputRef={register} email={false} />
        <TextFormField name="email" inputRef={register} email={true} />
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
