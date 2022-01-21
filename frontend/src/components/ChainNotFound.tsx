import { useTranslation } from "react-i18next";
import { useHistory } from "react-router-dom";
import { Button, makeStyles, Typography } from "@material-ui/core";

import { Close as CloseIcon } from "@mui/icons-material";

import theme from "../util/theme";

export const ChainNotFound = ({
  searchTerm,
  backAction,
}: {
  searchTerm: string;
  backAction: any;
}) => {
  const classes = makeStyles(theme as any)();

  const { t } = useTranslation();
  const history = useHistory();

  return (
    <div className={classes.alertContainer}>
      <CloseIcon onClick={backAction} className={classes.closeIcon} />

      <Typography component="h1">
        {`${t("noLoopsFoundIn")}`} <span>{searchTerm}</span>
      </Typography>

      <Typography component="p">
        Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod
        tempor incididunt ut labore et dolore magna aliqua.
      </Typography>

      <div>
        <Button
          className={classes.buttonCta}
          variant="contained"
          color="primary"
          onClick={backAction}
          key={"btn-submit-1"}
          href="#"
        >
          {t("joinWaitingList")}
        </Button>
        <Button
          className={classes.buttonCtaContained}
          variant="contained"
          color="primary"
          onClick={() => history.push("/loops/new-signup")}
          key={"btn-submit-2"}
          type="submit"
        >
          {t("startNewLoop")}
        </Button>
      </div>
    </div>
  );
};
