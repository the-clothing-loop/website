import { useState, useEffect } from "react";
import { useParams, useHistory, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Helmet } from "react-helmet";

import { Typography } from "@mui/material";
import { makeStyles } from "@mui/styles";

import theme from "../util/theme";

// Project resources
import ChainDetailsForm from "../components/ChainDetailsForm";
import { chainGet, chainUpdate } from "../api/chain";
import { Chain } from "../api/types";

const ChainEdit = () => {
  const { t } = useTranslation();
  let history = useHistory();
  let location = useLocation();
  const { chainId } = useParams<{ chainId: string }>();

  const [chain, setChain] = useState<Chain>();
  const classes = makeStyles(theme as any)();
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const handleSubmit = async (values: Chain) => {
    const newChainData = {
      ...values,
    };

    console.log(`updating chain information: ${JSON.stringify(newChainData)}`);
    try {
      await chainUpdate(newChainData);
      setSubmitted(true);
      history.push({
        pathname: `/loops/${chainId}/members`,
        state: { message: t("saved") },
      });
    } catch (e: any) {
      console.error(`Error updating chain: ${JSON.stringify(e)}`);
      setSubmitError(e.message);
    }
  };

  useEffect(() => {
    (async () => {
      try {
        let chain = (await chainGet(chainId)).data;

        setChain(chain);
      } catch {
        console.error(`chain ${chainId} does not exist`);
      }
    })();
  }, [chainId]);

  return !chain ? null : (
    <>
      <Helmet>
        <title>The Clothing Loop | Edit Loop details</title>
        <meta name="description" content="Edit Loop details" />
      </Helmet>
      <div className={classes.formContainerLocation}>
        <div className={classes.newLoopLocationForm}>
          <Typography
            variant="h3"
            className={classes.pageTitle}
            style={{ textAlign: "center" }}
          >
            {t("editLoopInformation")}
          </Typography>

          <ChainDetailsForm
            onSubmit={handleSubmit}
            submitError={submitError}
            initialValues={chain}
          />
        </div>
      </div>
    </>
  );
};

export default ChainEdit;
