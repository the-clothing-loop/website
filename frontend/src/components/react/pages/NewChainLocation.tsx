import { useEffect } from "react";

import ProgressBar from "../components/ProgressBar";
import ChainDetailsForm, {
  type RegisterChainForm,
} from "../components/ChainDetailsForm";
import {
  registerChainAdmin,
  type RequestRegisterChain,
  type RequestRegisterUser,
} from "../../../api/login";

import { chainCreate } from "../../../api/chain";

import { GinParseErrors } from "../util/gin-errors";
import { chainGetNear } from "../../../api/chain";
import { useTranslation } from "react-i18next";
import { useStore } from "@nanostores/react";
import { $authUser, authUserRefresh } from "../../../stores/auth";
import { addModal, addToastError } from "../../../stores/toast";
import getQuery from "../util/query";
import useLocalizePath from "../util/localize_path.hooks";
import useHydrated from "../util/hydrated.hooks";

export interface State {
  only_create_chain: string;
  // RequestRegisterUser;
  register_user?: string;
}

const PUBLIC_BASE_URL = import.meta.env.PUBLIC_BASE_URL;

export default function NewChainLocation() {
  const { t, i18n } = useTranslation();
  const localizePath = useLocalizePath(i18n);
  const [isOnlyCreateChainQ, registerUserQ] = getQuery(
    "only_create_chain",
    "register_user",
  );
  const authUser = useStore($authUser);

  const clientValues = useHydrated(() => {
    let registerUserObj: RequestRegisterUser | undefined;
    if (registerUserQ) {
      registerUserObj = JSON.parse(decodeURI(registerUserQ));
    }
    return {
      isOnlyCreateChain: isOnlyCreateChainQ == "true",
      registerUser: registerUserObj,
    };
  });

  useEffect(() => {
    if (
      clientValues &&
      !clientValues.isOnlyCreateChain &&
      !clientValues.registerUser
    ) {
      window.location.href = localizePath("/loops/new/users/signup");
    }
  }, [clientValues]);

  async function onSubmit(values: RegisterChainForm) {
    let user = clientValues?.isOnlyCreateChain
      ? authUser
      : clientValues?.registerUser;
    if (!user) {
      addToastError("User is not availible", 400);
      return;
    }
    const newChain: RequestRegisterChain = {
      name: values.name,
      description: values.description,
      address: values.address,
      country_code: values.country_code,
      latitude: values.latitude,
      longitude: values.longitude,
      radius: values.radius,
      open_to_new_members: true,
      sizes: values.sizes,
      genders: values.genders,
      allow_toh: true,
    };

    if (!(newChain.address?.length > 5)) {
      addToastError(t("required") + ": " + t("loopLocation"), 400);
      return;
    }

    let nearbyChains = (
      await chainGetNear({
        latitude: values.latitude,
        longitude: values.longitude,
        radius: 3,
      })
    ).data;

    const funcCreateChain = clientValues?.isOnlyCreateChain
      ? async () => {
          try {
            await chainCreate(newChain);
            await authUserRefresh(true);

            window.goatcounter?.count({
              path: "new-chain",
              title: "New chain",
              event: true,
            });
            window.location.href = localizePath(
              "/loops/new/confirmation/?name=" + newChain.name,
            );
          } catch (err: any) {
            console.error("Error creating chain:", err, newChain);
            addToastError(GinParseErrors(t, err), err?.status);
          }
        }
      : async () => {
          console.info("creating user: ", user);
          try {
            if (!user)
              throw "Could not find user when running the create user function";
            await registerChainAdmin(
              {
                name: user.name,
                email: user.email,
                address: user.address,
                phone_number: user.phone_number,
                newsletter: clientValues?.registerUser?.newsletter || false,
                sizes: values.sizes || [],
                latitude: user.latitude || 0,
                longitude: user.longitude || 0,
              },
              newChain,
            );
            if (window.goatcounter) {
              window.goatcounter.count({
                path: "new-chain",
                title: "New chain",
                event: true,
              });
              window.goatcounter.count({
                path: "new-user",
                title: "New user",
                event: true,
              });
            }
            window.location.href = localizePath(
              "/loops/new/confirmation/?name=" + newChain.name,
            );
          } catch (err: any) {
            console.error(
              `Error creating user and chain: ${JSON.stringify(err)}`,
            );
            addToastError(GinParseErrors(t, err), err?.status);
          }
        };
    if (nearbyChains.length > 0) {
      addModal({
        message: t("similarLoopNearby"),
        content: () => (
          <ul
            className={`text-sm font-semibold mx-8 ${
              nearbyChains.length > 1 ? "list-disc" : "list-none text-center"
            }`}
          >
            {nearbyChains.map((c) => (
              <li key={c.uid}>
                <a
                  onClick={(e) => {
                    e.stopPropagation();
                  }}
                  target="_blank"
                  href={
                    PUBLIC_BASE_URL +
                    localizePath("/loops/users/signup/?chain=" + c.uid)
                  }
                >
                  {c.name}
                </a>
              </li>
            ))}
          </ul>
        ),
        actions: [
          {
            text: t("create"),
            type: "primary",
            fn: () => {
              funcCreateChain();
            },
          },
        ],
      });
    } else {
      await funcCreateChain();
    }
  }

  return (
    <>
      <main className="container lg:max-w-screen-lg mx-auto md:px-20 pt-4">
        <div className="bg-teal-light p-8">
          <h1 className="text-center font-medium text-secondary text-5xl mb-6">
            {t("startNewLoop")}
          </h1>
          <div className="text-center mb-6">
            <ProgressBar
              activeStep={1}
              disabledStep={clientValues?.isOnlyCreateChain ? 0 : undefined}
            />
          </div>
          <ChainDetailsForm
            onSubmit={onSubmit}
            //submitError={error}
            showBack={!clientValues?.isOnlyCreateChain}
            showAllowedTOH={!authUser?.accepted_toh}
            showAllowedDPA={!authUser?.accepted_dpa}
            submitText={t("submit")}
          />
        </div>
      </main>
    </>
  );
}
