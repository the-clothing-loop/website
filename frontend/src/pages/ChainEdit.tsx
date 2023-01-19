import { useState, useEffect, useContext } from "react";
import { useParams, useHistory } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Helmet } from "react-helmet";

// Project resources
import ChainDetailsForm, {
  RegisterChainForm,
} from "../components/ChainDetailsForm";
import { chainGet, chainUpdate, ChainUpdateBody } from "../api/chain";
import { Chain } from "../api/types";
import { ToastContext } from "../providers/ToastProvider";
import { GinParseErrors } from "../util/gin-errors";

interface Params {
  chainUID: string;
}

export default function ChainEdit() {
  const { t } = useTranslation();
  const history = useHistory();
  const { addToastError } = useContext(ToastContext);
  const { chainUID } = useParams<Params>();

  const [chain, setChain] = useState<Chain>();

  const handleSubmit = async (values: RegisterChainForm) => {
    const newChainData: ChainUpdateBody = {
      ...values,
      uid: chainUID,
    };

    console.log(`updating chain information: ${JSON.stringify(newChainData)}`);
    try {
      await chainUpdate(newChainData);
      setTimeout(() => {
        history.goBack();
      }, 1200);
    } catch (err: any) {
      console.error(`Error updating chain: ${JSON.stringify(err)}`);
      addToastError(GinParseErrors(t, err), err?.status);
    }
  };

  useEffect(() => {
    (async () => {
      try {
        let chain = (await chainGet(chainUID)).data;

        setChain(chain);
      } catch (err: any) {
        console.error(`chain ${chainUID} does not exist`);
        addToastError(GinParseErrors(t, err), err?.status);
      }
    })();
  }, [chainUID]);

  return chain ? (
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
          initialValues={chain}
        />
      </main>
    </>
  ) : null;
}
