import { useState, useEffect, useMemo } from "react";

import type { User } from "../../../api/types";
import {
  userGetByUID,
  userUpdate,
  type UserUpdateBody,
} from "../../../api/user";
import { GinParseErrors } from "../util/gin-errors";
import AddressForm, { type ValuesForm } from "../components/AddressForm";
import { useTranslation } from "react-i18next";
import { addToastError } from "../../../stores/toast";
import { useStore } from "@nanostores/react";
import { $authUser } from "../../../stores/auth";
import getQuery from "../util/query";
import useLocalizePath from "../util/localize_path.hooks";

export default function UserEdit() {
  const { t, i18n } = useTranslation();
  const localizePath = useLocalizePath(i18n);
  const [chainUID, userUIDQ] = getQuery("chain", "user");
  const [user, setUser] = useState<User>();
  const authUser = useStore($authUser);

  let userUID = userUIDQ === "me" ? authUser?.uid : userUIDQ;

  const userIsChainAdmin = useMemo(
    () =>
      user?.chains.find((uc) => uc.chain_uid === chainUID)?.is_chain_admin ||
      false,
    [user, chainUID],
  );

  const userIsAnyChainAdmin = useMemo(
    () => !!user?.chains.find((uc) => uc.is_chain_admin),
    [user],
  );

  function onSubmit(values: ValuesForm) {
    console.info("submit", { ...values });
    if (!userUID) return;
    (async () => {
      try {
        let userUpdateBody: UserUpdateBody = {
          user_uid: userUID,
          ...values,
        };
        if (chainUID) userUpdateBody.chain_uid = chainUID;
        console.info(userUpdateBody);

        await userUpdate(userUpdateBody);
        window.history.back();
      } catch (err: any) {
        addToastError(GinParseErrors(t, err), err?.status);
      }
    })();
  }

  useEffect(() => {
    if (!userUID) return;
    (async () => {
      try {
        const _user = (await userGetByUID(chainUID, userUID, {})).data;
        setUser(_user);
      } catch (error) {
        console.warn(error);
      }
    })();
  }, [userUID]);

  if (authUser === null) {
    window.location.href = localizePath("/users/login");
    return <div />;
  }
  if (!user || !authUser) return null;
  let isMe = user.uid === authUser.uid;
  return (
    <>
      <main>
        <div className="bg-teal-light w-full container sm:max-w-screen-sm mx-auto p-6">
          <h1 className="font-sans font-semibold text-3xl text-secondary mb-4">
            {chainUID
              ? user.is_root_admin || userIsChainAdmin
                ? t("editAdminContacts")
                : t("editParticipantContacts")
              : t("editAccount")}
          </h1>

          <AddressForm
            onSubmit={onSubmit}
            userUID={userUID}
            chainUID={chainUID}
            classes="mb-6"
            showNewsletter={isMe}
            isNewsletterRequired={userIsAnyChainAdmin && !user.is_root_admin}
          />

          <div className="flex">
            <button
              type="button"
              onClick={() => window.history.back()}
              className="btn btn-secondary btn-outline"
            >
              {t("back")}
            </button>

            <button
              type="submit"
              className="btn btn-primary ml-4"
              form="address-form"
            >
              {t("submit")}
              <span className="icon-arrow-right ml-4 rtl:hidden"></span>
              <span className="icon-arrow-left mr-4 ltr:hidden"></span>
            </button>
          </div>
        </div>
      </main>
    </>
  );
}
