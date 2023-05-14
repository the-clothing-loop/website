import { useState, useEffect, useMemo, FormEvent, useContext } from "react";
import { useParams, useHistory, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Helmet } from "react-helmet";
import { UID, User } from "../api/types";
import {
  userGetByUID,
  userHasNewsletter,
  userUpdate,
  UserUpdateBody,
} from "../api/user";
import { ToastContext } from "../providers/ToastProvider";
import { GinParseErrors } from "../util/gin-errors";
import { AuthContext } from "../providers/AuthProvider";
import AddressForm from "../components/AddressForm";
import FormJup from "../util/form-jup";

interface Params {
  userUID: UID;
}

interface State {
  chainUID?: UID;
}
interface RegisterUserForm {
  name: string;
  email: string;
  phone: string;
  sizes: string[];
  privacyPolicy: boolean;
  newsletter: boolean;
}

export default function UserEdit() {
  const { t } = useTranslation();
  const history = useHistory();
  const { addToastError } = useContext(ToastContext);
  const { chainUID } = useLocation<State>().state || {};

  const [hasNewsletter, setHasNewsletter] = useState<boolean>();

  const [user, setUser] = useState<User>();
  const { authUser } = useContext(AuthContext);
  const params = useParams<Params>();

  const userUID: string =
    params.userUID == "me" ? authUser!.uid : params.userUID;

  const userIsChainAdmin = useMemo(
    () =>
      user?.chains.find((uc) => uc.chain_uid === chainUID)?.is_chain_admin ||
      false,
    [user]
  );
  const userIsAnyChainAdmin = useMemo(
    () => !!user?.chains.find((uc) => uc.is_chain_admin),
    [user]
  );

  function onSubmit(e: FormEvent, address: string, sizes: string[]) {
    e.preventDefault();

    const values = FormJup<RegisterUserForm>(e);

    (async () => {
      try {
        let userUpdateBody: UserUpdateBody = {
          user_uid: userUID,
          name: values.name,
          phone_number: values.phone,
          newsletter: hasNewsletter,
          address: address,
          sizes: sizes,
        };
        if (chainUID) userUpdateBody.chain_uid = chainUID;
        console.log(userUpdateBody);
        await userUpdate(userUpdateBody);
        setTimeout(() => {
          history.goBack();
        }, 1200);
      } catch (err: any) {
        console.error(`Error updating user: ${JSON.stringify(e)}`);
        addToastError(GinParseErrors(t, err), err?.status);
      }
    })();
  }

  useEffect(() => {
    (async () => {
      try {
        const user = (await userGetByUID(chainUID, userUID)).data;
        const _hasNewsletter = (await userHasNewsletter(chainUID, userUID))
          .data;
        setUser(user);
        setHasNewsletter(_hasNewsletter);
      } catch (error) {
        console.warn(error);
      }
    })();
  }, [history]);

  if (!user) return null;
  return (
    <>
      <Helmet>
        <title>The Clothing Loop | Edit user</title>
        <meta name="description" content="Edit user" />
      </Helmet>
      <main>
        <div className="bg-teal-light w-full container sm:max-w-screen-xs mx-auto p-6">
          <h1 className="font-sans font-semibold text-3xl text-secondary mb-4">
            {chainUID
              ? user.is_root_admin || userIsChainAdmin
                ? t("editAdminContacts")
                : t("editParticipantContacts")
              : t("editAccount")}
          </h1>
          <AddressForm onSubmit={onSubmit} classes="" />

          <div className="form-control mb-4">
            <label className="label cursor-pointer">
              <span className="label-text">{t("newsletterSubscription")}</span>
              <input
                form="address-form"
                type="checkbox"
                checked={hasNewsletter}
                onChange={() => setHasNewsletter(!hasNewsletter)}
                required={
                  (user && user.is_root_admin) || userIsAnyChainAdmin
                    ? true
                    : false
                }
                className="checkbox"
                name="newsletter"
              />
            </label>
          </div>
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
              className="btn btn-primary ml-3"
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
