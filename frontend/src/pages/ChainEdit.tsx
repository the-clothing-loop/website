import { useState, useEffect } from "react";
import { useParams, useHistory, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Helmet } from "react-helmet";

import { Typography } from "@mui/material";
import { makeStyles } from "@mui/styles";

import theme from "../util/theme";

// Project resources
import ChainDetailsForm, {
  RegisterChainForm,
} from "../components/ChainDetailsForm";
import { chainGet, chainUpdate, ChainUpdateBody } from "../api/chain";
import { Chain } from "../api/types";

interface Params {
  chainUID: string;
}

const ChainEdit = () => {
  const { t } = useTranslation();
  let history = useHistory();
  let location = useLocation();
  const { chainUID } = useParams<Params>();

  const [chain, setChain] = useState<Chain>();
  const classes = makeStyles(theme as any)();
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (values: RegisterChainForm) => {
    const newChainData: ChainUpdateBody = {
      ...values,
      uid: chainUID,
    };

    console.log(`updating chain information: ${JSON.stringify(newChainData)}`);
    try {
      await chainUpdate(newChainData);
      setSubmitted(true);
      setTimeout(() => {
        history.goBack();
      }, 1200);
    } catch (e: any) {
      console.error(`Error updating chain: ${JSON.stringify(e)}`);
      setError(e?.data || `Error: ${JSON.stringify(e)}`);
    }
  };

  useEffect(() => {
    (async () => {
      try {
        let chain = (await chainGet(chainUID)).data;

        setChain(chain);
      } catch (e: any) {
        console.error(`chain ${chainUID} does not exist`);
        setError(e?.data || `Error: ${JSON.stringify(e)}`);
      }
    })();
  }, [chainUID]);

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
          <Typography className="formSubtitle">
            {t("clickToChangeLoopLocation")}
          </Typography>
          <ChainDetailsForm
            onSubmit={handleSubmit}
            submitError={error}
            submitted={submitted}
            initialValues={chain}
          />
        </div>
      </div>
    </>
  );
};

export default ChainEdit;
