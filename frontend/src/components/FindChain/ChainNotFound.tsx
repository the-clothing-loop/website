import { useTranslation } from "react-i18next";
import { useHistory } from "react-router-dom";
import { makeStyles } from "@mui/styles";

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
      <span className="feather feather-x" onClick={backAction} />

      <h1>
        {`${t("noLoopsFoundIn")}`} <span>{searchTerm}</span>
      </h1>

      <p>{t("ThereIsNoActiveLoopInYourRegion")}</p>

      <div>
        <button
          className="tw-btn tw-btn-primary tw-btn-outline"
          onClick={backAction}
        >
          {t("joinWaitingList")}
        </button>
        <button
          className="tw-btn tw-btn-primary"
          onClick={() => history.push("/loops/new/users/signup")}
          type="submit"
        >
          {t("startNewLoop")}
        </button>
      </div>
    </div>
  );
};
