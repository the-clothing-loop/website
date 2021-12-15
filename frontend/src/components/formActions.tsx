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
  const [privacyPolicyOpen, setPrivacyPolicyOpen] = useState(false);

  return (
    <div style={{padding:'2% 0'}}>
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
                {t("agreeToOur")}
              </Typography>
              <a
                href="#privacyPolicy"
                onClick={(e: any) => handleClick(e, setPrivacyPolicyOpen)}
                id="privacyPolicyPopup"
                className={classes.a}
              >
                Privacy Policy*
              </a>
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
            Lorem ipsum dolor sit amet, consectetur adipiscing elit.
            Pellentesque ullamcorper eget nisi sed facilisis. Proin feugiat a
            risus ac iaculis. Nunc commodo nulla id magna faucibus, et elementum
            diam ultrices. Suspendisse et lorem aliquam sapien finibus cursus.
            Nam id arcu sem. Quisque facilisis odio et erat pretium, ac interdum
            diam posuere. Nunc vulputate molestie quam, sit amet finibus velit
            mattis eget. Pellentesque molestie malesuada tincidunt. Proin a
            luctus mauris. Donec tortor justo, hendrerit sit amet turpis ac,
            interdum consectetur magna.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setNewsletterOpen(false)} autoFocus>
            Close
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={privacyPolicyOpen}
        onClose={() => setPrivacyPolicyOpen(false)}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">{"Privacy Policy"}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            We are buying more and more garments and wearing them shorter and
            shorter. The Clothing Loop tackles this growing problem while
            connecting people in the neighborhood in a fun and sustainable way.
            The idea of the Clothing Loop is simple: (large) bags filled with
            clothing travel a route past all participants in a particular city
            or neighborhood. Do you receive the bag at home? Then you can take
            out what you like and put back something that is still in good
            condition, but ready for a new owner. If you want, you can share a
            photo with your new addition in the corresponding WhatsApp group.
            Then you take the bag to the next neighbor on the list. We started a
            year ago in Amsterdam in the Netherlands as a corona-proof, local
            alternative for clothing swap events and now have more than 7500
            participants spread over more than 210 chains across the country.
            The success has now been picked up by numerous (national) media (see
            for example: NOS). Our goal is to spread this initiative globally.
            To this end, we are building an online platform where anyone,
            anywhere can start or join a chain.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPrivacyPolicyOpen(false)} autoFocus>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default FormActions;
