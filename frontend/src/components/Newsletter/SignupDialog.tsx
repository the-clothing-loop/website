import { useState } from "react";

// Material
import { makeStyles, Dialog } from "@material-ui/core";

// Project resources
import theme from "../../util/theme";
import { Newsletter } from "../../components/Newsletter/Newsletter";
import BagImage from "../../images/Utrecht.jpeg";

const SignupDialog = () => {
  const classes = makeStyles(theme as any)();
  const [showDialog, setShowDialog] = useState(true);

  return (
    <Dialog
      open={showDialog}
      onClose={() => setShowDialog(false)}
      maxWidth="lg"
      fullWidth={true}
    >
      <div className={`newsletter-dialog ${classes.newsletterDialog}`}>
        <div
          style={{ backgroundImage: `url("${BagImage}")` }}
          className="dialog-section dialog-image"
        ></div>
        <div className="dialog-section">
          <Newsletter />
        </div>
      </div>
    </Dialog>
  );
};

export default SignupDialog;
