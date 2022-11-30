import { useState, useEffect } from "react";
import { useParams, useHistory } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Helmet } from "react-helmet";

// Project resources
import ChainDetailsForm, {
  RegisterChainForm,
} from "../components/ChainDetailsForm";
import { chainGet, chainUpdate, ChainUpdateBody } from "../api/chain";
import { Chain } from "../api/types";

interface Params {
  chainUID: string;
}

export default function ChainEdit() {
  const { t } = useTranslation();
  let history = useHistory();
  const { chainUID } = useParams<Params>();

  const [chain, setChain] = useState<Chain>();
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
      <main className="container mx-auto px-4 md:px-20 pt-10">
        <h1 className="text-center font-sans font-semibold text-secondary text-4xl mb-4">
          {t("editLoopInformation")}
        </h1>
        <p className="text-sm mb-1">{t("clickToChangeLoopLocation")}</p>
        <ChainDetailsForm
          showBack
          onSubmit={handleSubmit}
          submitError={error}
          submitted={submitted}
          initialValues={chain}
        />
      </main>
    </>
  );
}
