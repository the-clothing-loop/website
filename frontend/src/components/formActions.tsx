import { useState } from "react";
import { useTranslation } from "react-i18next";
import { CheckboxField } from "../components/FormFields";
import theme from "../util/theme";
import Typography from "@material-ui/core/Typography";
// import { useTranslation } from "react-i18next";

import { makeStyles } from "@material-ui/core";
import Button from "@material-ui/core/Button";

interface IProps {
  handleClick: (e: any, action: any) => void;
}

const FormActions: React.FC<IProps> = ({ handleClick }: IProps) => {
  const classes = makeStyles(theme as any)();
  const { t } = useTranslation();

  return (
    <div style={{ padding: "5% 0" }}>
      <CheckboxField
        required={false}
        label={
          <>
            <Typography component="p" className={classes.p}>
              {t("subscribeToTheClothingLoopNewsletter")}
            </Typography>
          </>
        }
        name="newsletter"
        type="checkbox"
      />
      <CheckboxField
        required={true}
        label={
          <>
            <div className={classes.actionsWrapper}>
              <Typography component="p" className={classes.p}>
                I am not a minor and accept and agree to
                <a href="/terms-of-use" target="_blank" className={classes.a}>
                  Terms of Use
                </a>
                and
                <a href="/privacy-policy" target="_blank" className={classes.a}>
                  Privacy Policy
                </a>
                *
              </Typography>
            </div>
          </>
        }
        name="privacyPolicy"
        type="checkbox"
      />
    </div>
  );
};

export default FormActions;
