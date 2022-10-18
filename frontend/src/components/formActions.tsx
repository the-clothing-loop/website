import { useState } from "react";
import { Trans, useTranslation } from "react-i18next";
import { CheckboxField } from "../components/FormFields";
import theme from "../util/theme";

import { Typography } from "@mui/material";
import { makeStyles } from "@mui/styles";

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
      />
      <CheckboxField
        className="privacy-policy-action"
        required
        label={
          <>
            <div className={classes.actionsWrapper}>
              <Typography component="p" className={classes.p}>
                <Trans
                  i18nKey="iAmNotAMinor<1>Tos</1>And<2>PrivacyPolicy</2>Star"
                  components={{
                    "1": (
                      <a
                        href="/terms-of-use"
                        target="_blank"
                        className={classes.a}
                      ></a>
                    ),
                    "2": (
                      <a
                        href="/privacy-policy"
                        target="_blank"
                        className={classes.a}
                      ></a>
                    ),
                  }}
                ></Trans>
              </Typography>
            </div>
          </>
        }
        name="privacyPolicy"
      />
    </div>
  );
};

export default FormActions;
