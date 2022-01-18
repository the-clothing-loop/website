// Material
import { Helmet } from "react-helmet";
import { makeStyles } from "@material-ui/core";
import { useTranslation } from "react-i18next";

//Project resources
import theme from "../util/theme";

const MessageSubmitted = (props: any) => {
  const { t } = useTranslation();
  const classes = makeStyles(theme as any)();

  return (
    <>
      <Helmet>
        <title>Clothing-Loop | Message Submitted</title>
        <meta name="description" content="Thank you" />
      </Helmet>

      <div className={classes.pageGrid}>
        <h1
          style={{
            textTransform: "uppercase",
            color: "#C58C41",
          }}
        >
          The Clothing Loop
        </h1>
        <div>
          <h3>{t("thankYouForYourMessage")}</h3>
          <p>{t("weWillReplySoon")}</p>
        </div>
      </div>
    </>
  );
};

export default MessageSubmitted;
