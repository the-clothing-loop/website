import { useTranslation } from "react-i18next";
import { useHistory } from "react-router-dom";
import { Button, makeStyles, Typography } from "@material-ui/core";

import { Close as CloseIcon } from "@mui/icons-material";

import theme from "../../util/theme";

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
        {t("ThereIsNoActiveLoopInYourRegion")}
      </Typography>

      <div>
        <Button
          className={classes.buttonCta}
          variant="contained"
          color="primary"
          onClick={backAction}
          key={"btn-submit-1"}
          href="https://docs.google.com/forms/d/e/1FAIpQLSe3tb2KGckaXna4j8zQOaO7lyII6P0DzG7HjreHFYd_9c08Dg/viewform"
        >
          {t("joinWaitingList")}
        </Button>
        <Button
          className={classes.buttonCtaContained}
          variant="contained"
          color="primary"
          onClick={() => history.push("/loops/new/users/signup")}
          key={"btn-submit-2"}
          type="submit"
        >
          {t("startNewLoop")}
        </Button>
      </div>
    </div>
  );
};
