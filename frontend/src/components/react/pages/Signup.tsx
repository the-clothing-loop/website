// React / plugins
import { useState, useEffect } from "react";
import { Trans, useTranslation } from "react-i18next";

import { TwoColumnLayout } from "../components/Layouts";
import AddressForm, { type ValuesForm } from "../components/AddressForm";
import type { Chain, User } from "../../../api/types";
import { chainAddUser, chainGet } from "../../../api/chain";
import { registerBasicUser, registerOrphanedUser } from "../../../api/login";

import { GinParseErrors } from "../util/gin-errors";
import type { TFunction } from "i18next";
import { Categories } from "../../../api/enums";
import { useStore } from "@nanostores/react";
import { $authUser, authUserRefresh } from "../../../stores/auth";
import { addModal, addToastError } from "../../../stores/toast";
import getQuery from "../util/query";
import useLocalizePath from "../util/localize_path.hooks";
import OriginalImageToProxy from "../util/image_proxy";

export default function Signup() {
  const { t, i18n } = useTranslation();
  const localizePath = useLocalizePath(i18n);
  const authUser = useStore($authUser);
  const [chainUID] = getQuery("chain");
  const [chain, setChain] = useState<Chain | null>(null);
  const [submitted, setSubmitted] = useState(false);

  // Get chain id from the URL and save to state
  useEffect(() => {
    (async () => {
      if (chainUID) {
        try {
          const chain = (await chainGet(chainUID)).data;
          setChain(chain);
        } catch (err) {
          console.error(`chain ${chainUID} does not exist`);
        }
      }
    })();
  }, [chainUID]);

  function onSubmitCurrentUser() {
    if (authUser && chainUID) {
      chainAddUser(chainUID, authUser.uid, false)
        .then(() => {
          authUserRefresh(true);
        })
        .catch((err) => {
          addToastError(GinParseErrors(t, err), err?.status);
        });
    }
  }

  // Gather data from form, validate and send to firebase
  function onSubmitNewUser(values: ValuesForm) {
    let privacyPolicy = document.getElementsByName(
      "privacyPolicy",
    )[0] as HTMLInputElement;

    if (!privacyPolicy.checked) {
      addToastError(t("required") + " " + t("privacyPolicy"), 400);
      return;
    }

    (async () => {
      try {
        if (chainUID) {
          await registerBasicUser(values, chainUID);
        } else {
          console.info("register orphaned user");
          await registerOrphanedUser(values);
        }

        setSubmitted(true);
        window.goatcounter?.count({
          path: "new-user",
          title: "New user",
          event: true,
        });
      } catch (err: any) {
        console.error("Error creating user:", err);

        if (err?.code === "auth/invalid-phone-number") {
          console.log("1");
          addToastError(t("pleaseEnterAValid.phoneNumber"), 400);
        } else if (err?.status === 409) {
          console.log("2");

          addModal({
            message: err.data,
            actions: [
              {
                text: t("login"),
                type: "default",
                fn: () => {
                  window.location.href = localizePath("/users/login");
                },
              },
            ],
          });
        } else {
          console.log("3");
          addToastError(GinParseErrors(t, err), 400);
        }
      }
    })();
  }

  function onEmailExist(email: string) {
    console.log("Email already exists", email);
    addModal({
      message: t("userExists"),
      actions: [
        {
          text: t("login"),
          type: "default",
          fn: () => {
            let url = chainUID
              ? localizePath("/loops/users/login" + chainUID)
              : localizePath("/users/login");
            url += `?email=${email}`;
            window.location.href = url;
          },
        },
      ],
    });
  }

  if (submitted) {
    window.location.href = localizePath("/thankyou");
    return <div></div>;
  } else {
    let image = chain?.image
      ? {
          src: OriginalImageToProxy(chain.image, "x600")!,
          alt: "Loop cover image",
          credit: "",
        }
      : chain?.genders?.length && chain.genders[0] === Categories.men
        ? {
            src: "https://images.clothingloop.org/cx585,cw2678,x600/mannen_amersfoort.jpg",
            alt: "Two men wearing jumpers, the left wearing a baseball cap, the right glasses, between them is a large blue bag with the number 11 taped on.",
            credit: "",
          }
        : {
            src: "https://images.clothingloop.org/x600/join_loop.jpg",
            alt: "Nichon giving a large bag of clothes to another woman",
            credit: "Anke Teunissen",
          };

    return (
      <>
        <main className="md:p-10">
          <TwoColumnLayout
            t={t}
            img={image.src}
            alt={image.alt}
            credit={image.credit}
          >
            <div className="relative">
              <h1 className="font-semibold text-3xl text-secondary mb-3">
                {t("join")}
                <span> {chain?.name}</span>
              </h1>

              {authUser ? (
                <form
                  onSubmit={onSubmitCurrentUser}
                  className="max-w-xs"
                  id="address-form"
                >
                  <dl className="sm:absolute -top-8">
                    <dt className="inline font-bold mb-1">
                      {t("account") + ": "}
                    </dt>
                    <dd className="inline mb-2">{authUser.name}</dd>
                  </dl>
                  <div className="my-4">
                    <button
                      type="button"
                      className="btn btn-secondary btn-outline mr-3"
                      onClick={() => window.history.back()}
                    >
                      {t("back")}
                    </button>
                    <SubmitButton t={t} chain={chain} user={authUser} />
                  </div>
                </form>
              ) : (
                <div>
                  {!chain || (chain.open_to_new_members && chain.published) ? (
                    <>
                      <div className="mt-4 prose">
                        {t("doYouHaveAnAccount") + " "}
                        <Trans
                          i18nKey="clickHereToLogin"
                          components={{
                            "1": (
                              <a
                                className="font-small"
                                href={localizePath(
                                  chainUID
                                    ? "/loops/users/login/?chain=" + chainUID
                                    : "/users/login",
                                )}
                              />
                            ),
                          }}
                        />
                      </div>
                      <AddressForm
                        userUID={undefined}
                        onSubmit={onSubmitNewUser}
                        isNewsletterRequired={false}
                        showNewsletter
                        showTosPrivacyPolicy
                        onlyShowEditableAddress
                        onEmailExist={onEmailExist}
                        classes="mb-4"
                      />
                    </>
                  ) : null}
                  <div className="mb-4">
                    <button
                      type="button"
                      className="btn btn-secondary btn-outline mr-3"
                      onClick={() => window.history.back()}
                    >
                      {t("back")}
                    </button>
                    <SubmitButton t={t} chain={chain} />
                  </div>
                </div>
              )}
              <div className="text-sm">
                <p className="text">{t("troublesWithTheSignupContactUs")}</p>
                <a
                  className="link"
                  href="mailto:hello@clothingloop.org?subject=Troubles signing up to The Clothing Loop"
                >
                  hello@clothingloop.org
                </a>
              </div>
            </div>
          </TwoColumnLayout>
        </main>
      </>
    );
  }
}

function SubmitButton({
  t,
  chain,
  user,
}: {
  t: TFunction;
  chain: Chain | null;
  user?: User | null;
}) {
  if (user && chain) {
    let userChain = user.chains.find((uc) => uc.chain_uid === chain.uid);
    if (userChain) {
      if (userChain.is_approved) {
        return (
          <p className="bg-primary px-3 font-semibold text-sm border border-primary h-12 inline-flex items-center">
            {t("joined")}
            <span className="icon-check ms-3"></span>
          </p>
        );
      } else {
        return (
          <p className="px-3 font-semibold text-sm border border-secondary h-12 inline-flex items-center text-secondary">
            {t("pendingApproval")}
            <span className="icon-user-check ms-3"></span>
          </p>
        );
      }
    }
  }
  if (chain?.open_to_new_members == false || chain?.published == false) {
    return (
      <p className="px-3 font-semibold text-sm border border-secondary h-12 inline-flex items-center text-secondary">
        {t("closed")}
        <span className="icon-lock ms-3"></span>
      </p>
    );
  }

  return (
    <button type="submit" className="btn btn-primary" form="address-form">
      {t("join")}
      <span className="icon-arrow-right ml-4 rtl:hidden"></span>
      <span className="icon-arrow-left mr-4 ltr:hidden"></span>
    </button>
  );
}
