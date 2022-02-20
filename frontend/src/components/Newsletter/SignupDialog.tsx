import { useEffect, useState } from "react";

// Material
import { makeStyles, Dialog, IconButton } from "@material-ui/core";
import CloseIcon from "@mui/icons-material/Close";

// Project resources
import theme from "../../util/theme";
import { Newsletter } from "../../components/Newsletter/Newsletter";
import BagImage from "../../images/Utrecht.jpeg";

const SignupDialog = () => {
  const classes = makeStyles(theme as any)();
  const [showDialog, setShowDialog] = useState(false);

  useEffect(() => {
    setTimeout(() => {
      if (!localStorage.getItem("newsletterDialogSeen")) {
        setShowDialog(true);
      }
    }, 30_000);
  }, []);

  if (!showDialog) {
    return <></>;
  }

  const onClose = () => {
    setShowDialog(false);
    localStorage.setItem("newsletterDialogSeen", "true");
  };

  return (
    <Dialog open={showDialog} onClose={onClose} maxWidth="lg" fullWidth={true}>
      <div className={`newsletter-dialog ${classes.newsletterDialog}`}>
        <div
          style={{ backgroundImage: `url("${BagImage}")` }}
          className="dialog-section dialog-image"
        ></div>
        <div className="dialog-section">
          <Newsletter />
        </div>
      </div>
      <IconButton
        aria-label="close"
        onClick={onClose}
        className={classes.dialogCloseButton}
      >
        <CloseIcon />
      </IconButton>
    </Dialog>
  );
};

export default SignupDialog;
