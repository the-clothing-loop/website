import { useState } from "react";
import { Helmet } from "react-helmet";
import { Redirect, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { makeStyles, Typography } from "@material-ui/core";

import theme from "../util/theme";
import ProgressBar from "../components/ProgressBar";
import ChainDetailsForm from "../components/ChainDetailsForm";

const NewChainLocation = () => {
  const classes = makeStyles(theme as any)();
  const { t } = useTranslation();
  const { userId } = useParams<{ userId: string }>();
  const [submitError, setSubmitError] = useState("");
  const [submitted, setSubmitted] = useState<boolean>(false);

  const onSubmit = async (values: any) => {
    const newChain = {
      ...values,
      longitude: values.coordinates[0],
      latitude: values.coordinates[1],
      categories: { gender: values.clothingType, size: values.clothingSize },
      published: false,
      uid: userId,
    };

    console.log(`creating chain: ${JSON.stringify(newChain)}`);
    try {
      await createChain(newChain);
      setSubmitted(true);
    } catch (e: any) {
      console.error(`Error creating chain: ${JSON.stringify(e)}`);
      setSubmitError(e.message);
    }
  };

  if (submitted) {
    return <Redirect to={`/thankyou`} />;
  }

  return (
    <>
      <Helmet>
        <title>Clothing Loop | Create New Loop</title>
        <meta name="description" content="Create New Loop" />
      </Helmet>
      <div className={classes.formContainerLocation}>
        <div className={classes.newLoopLocationForm}>
          <Typography
            variant="h3"
            className={classes.pageTitle}
            style={{ textAlign: "center" }}
          >
            {t("startNewLoop")}
          </Typography>
          <div className={classes.progressBarWrapper}>
            <ProgressBar activeStep={1} />
          </div>
          <Typography className="formSubtitle">
            {t("clickToSetLoopLocation")}
          </Typography>
          <ChainDetailsForm onSubmit={onSubmit} submitError={submitError} />
        </div>
      </div>
    </>
  );
};

export default NewChainLocation;
