import { useState, useEffect } from "react";

// Project resources
import ChainDetailsForm, {
  type RegisterChainForm,
} from "../components/ChainDetailsForm";
import {
  chainGet,
  chainUpdate,
  type ChainUpdateBody,
} from "../../../api/chain";
import type { Chain } from "../../../api/types";

import { GinParseErrors } from "../util/gin-errors";
import { useTranslation } from "react-i18next";
import { useStore } from "@nanostores/react";
import { $authUser } from "../../../stores/auth";
import getQuery from "../util/query";
import { addToastError } from "../../../stores/toast";

export default function ChainEdit() {
  const { t } = useTranslation();

  const authUser = useStore($authUser);
  const [chainUID] = getQuery("chain");

  const [chain, setChain] = useState<Chain>();

  const handleSubmit = async (values: RegisterChainForm) => {
    const newChainData: ChainUpdateBody = {
      ...values,
      uid: chainUID,
    };

    console.info("updating chain information", newChainData);
    try {
      await chainUpdate(newChainData);
      setTimeout(() => {
        window.history.back();
      }, 1200);
    } catch (err: any) {
      console.error("Error updating chain:", err);
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
      <main className="container mx-auto px-4 md:px-20 pt-10">
        <h1 className="text-center font-sans font-semibold text-secondary text-4xl mb-4">
          {t("editLoopInformation")}
        </h1>
        <p className="text-sm mb-1">{t("clickToChangeLoopLocation")}</p>
        <ChainDetailsForm
          showBack
          onSubmit={handleSubmit}
          initialValues={chain}
          showAllowedTOH={!authUser?.accepted_toh}
          showAllowedDPA={!authUser?.accepted_dpa}
          submitText={t("save")}
        />
      </main>
    </>
  ) : null;
}
