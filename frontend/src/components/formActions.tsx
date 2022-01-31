import { useState } from "react";
import { useTranslation } from "react-i18next";
import { CheckboxField } from "../components/FormFields";
import theme from "../util/theme";
import Typography from "@material-ui/core/Typography";
// import { useTranslation } from "react-i18next";

import {
  makeStyles,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@material-ui/core";
import Button from "@material-ui/core/Button";

interface IProps {
  handleClick: (e: any, action: any) => void;
}

const FormActions: React.FC<IProps> = ({ handleClick }: IProps) => {
  const classes = makeStyles(theme as any)();
  const { t } = useTranslation();

  const [newsletterOpen, setNewsletterOpen] = useState(false);

  return (
    <div style={{ padding: "2% 0" }}>
      <CheckboxField
        required={false}
        label={
          <>
            <div className={classes.actionsWrapper}>
              {" "}
              <Typography component="p" className={classes.p}>
                {t("subscribeTo")}
              </Typography>
              <a
                href="#newsletter"
                onClick={(e: any) => handleClick(e, setNewsletterOpen)}
                id="newsletterPopup"
                className={classes.a}
              >
                The Clothing Loop Newsletter
              </a>
            </div>
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
                <a href="/terms-of-use" className={classes.a}>
                  Terms of Use
                </a>
                and
                <a href="/privacy-policy" className={classes.a}>
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

      <Dialog
        open={newsletterOpen}
        onClose={() => setNewsletterOpen(false)}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          {"The Clothing Loop Newsletter"}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            When subscribed, you will receive The Clothing Loop newsletter. This
            newsletter will always be written and composed by us, with things
            relevant to the initiative. If branded and paid for content will be
            relevant in the future, we will always specify If you have agreed to
            receive our newsletter, you may always opt out at a later date. You
            can unsubscribe via the unsubscribe option at the bottom of the
            newsletter.
            <br /> Read more about our
            <a href="/privacy-policy"> Privacy Policy</a>
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setNewsletterOpen(false)} autoFocus>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default FormActions;
