import { useState, useEffect, useMemo, useContext } from "react";
import { useParams, useHistory, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Helmet } from "react-helmet";
import { UID, User } from "../api/types";
import { userGetByUID, userUpdate, UserUpdateBody } from "../api/user";
import { ToastContext } from "../providers/ToastProvider";
import { GinParseErrors } from "../util/gin-errors";
import { AuthContext } from "../providers/AuthProvider";
import AddressForm, { ValuesForm } from "../components/AddressForm";

interface Params {
  userUID: UID;
}

interface State {
  chainUID?: UID;
}

export default function UserEdit() {
  const { t } = useTranslation();
  const history = useHistory();
  const { addToastError } = useContext(ToastContext);
  const { chainUID } = useLocation<State>().state || {};
  const [user, setUser] = useState<User>();
  const { authUser } = useContext(AuthContext);
  const params = useParams<Params>();

  const userUID = params.userUID == "me" ? authUser?.uid : params.userUID;

  const userIsChainAdmin = useMemo(
    () =>
      user?.chains.find((uc) => uc.chain_uid === chainUID)?.is_chain_admin ||
      false,
    [user, chainUID]
  );
  const userIsAnyChainAdmin = useMemo(
    () => !!user?.chains.find((uc) => uc.is_chain_admin),
    [user]
  );

  function onSubmit(values: ValuesForm) {
    console.info("submit", { ...values });
    if (!userUID) return;
    (async () => {
      try {
        let userUpdateBody: UserUpdateBody = {
          user_uid: userUID,
          name: values.name,
          phone_number: values.phone,
          newsletter: values.newsletter,
          address: values.address,
          sizes: values.sizes,
          latitude: values.latitude,
          longitude: values.longitude,
        };
        if (chainUID) userUpdateBody.chain_uid = chainUID;
        console.log(userUpdateBody);

        await userUpdate(userUpdateBody);
        setTimeout(() => {
          history.goBack();
        }, 1200);
      } catch (err: any) {
        addToastError(GinParseErrors(t, err), err?.status);
      }
    })();
  }

  useEffect(() => {
    if (!userUID) return;
    (async () => {
      try {
        const _user = (await userGetByUID(chainUID, userUID)).data;
        setUser(_user);
      } catch (error) {
        console.warn(error);
      }
    })();
  }, [history, userUID]);

  if (!user) return null;
  return (
    <>
      <Helmet>
        <title>The Clothing Loop | Edit user</title>
        <meta name="description" content="Edit user" />
      </Helmet>
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
            showNewsletter
          />

          <div className="flex">
            <button
              type="button"
              onClick={() => history.goBack()}
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
              <span className="feather feather-arrow-right ml-4 rtl:hidden"></span>
              <span className="feather feather-arrow-left mr-4 ltr:hidden"></span>
            </button>
          </div>
        </div>
      </main>
    </>
  );
}
