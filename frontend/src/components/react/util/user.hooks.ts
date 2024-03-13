import { useEffect, useMemo, useState } from "react";
import type { User } from "../../../api/types";
import PopupLegal from "../components/PopupLegal";
import type { TFunction } from "i18next";
import { addModal } from "../../../stores/toast";
import { authUserRefresh } from "../../../stores/auth";

export const IsChainAdmin = (user: User | null | undefined) =>
  !!user?.chains.find((uc) => uc.is_chain_admin);

export function useLegal(t: TFunction, authUser: User | undefined | null) {
  const [tmpAcceptedToh, setTmpAcceptedToh] = useState(false);
  useEffect(() => {
    const isChainAdmin = IsChainAdmin(authUser);
    if (
      authUser &&
      isChainAdmin &&
      (authUser.accepted_toh === false || authUser.accepted_dpa === false)
    ) {
      if (authUser.accepted_toh)
        console.log("You have not accepted the Terms of Hosts!");
      if (authUser.accepted_dpa)
        console.log("You have not accepted the Data Processing Agreement!");
      PopupLegal({
        t,
        authUserRefresh: () => authUserRefresh(true),
        addModal,
        authUser,
        tmpAcceptedToh,
        setTmpAcceptedToh,
      });
    }
  }, [authUser]);
}
