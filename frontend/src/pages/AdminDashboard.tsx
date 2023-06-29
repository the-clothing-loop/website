//Resources
import { Link, useHistory } from "react-router-dom";
import { useContext, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Helmet } from "react-helmet";

import { AuthContext } from "../providers/AuthProvider";
import { userPurge } from "../api/user";
import { ToastContext } from "../providers/ToastProvider";
import ChainsList from "../components/ChainsList";
import { useEscape } from "../util/escape.hooks";
import { Chain } from "../api/types";

export default function AdminDashboard() {
  const { t } = useTranslation();
  const { authUser } = useContext(AuthContext);
  const { addModal } = useContext(ToastContext);
  const [chains, setChains] = useState<Chain[]>([]);
  const history = useHistory();

  function deleteClicked() {
    const chainNames = authUser?.is_root_admin
      ? undefined
      : (authUser?.chains
          .filter((uc) => uc.is_chain_admin)
          .map((uc) => chains.find((c) => c.uid === uc.chain_uid))
          .filter((c) => c && c.total_hosts && c.total_hosts === 1)
          .map((c) => c!.name) as string[]);

    addModal({
      message: t("deleteAccount"),
      content:
        chainNames && chainNames.length
          ? () => (
              <>
                <p className="mb-2">{t("deleteAccountWithLoops")}</p>
                <ul className="list-disc text-sm font-semibold mx-8">
                  {chainNames.map((name) => (
                    <li key={name}>{name}</li>
                  ))}
                </ul>
              </>
            )
          : undefined,
      actions: [
        {
          text: t("delete"),
          type: "error",
          fn: () => {
            userPurge(authUser!.uid).then(() => history.push("/users/logout"));
          },
        },
      ],
    });
  }

  function logoutClicked() {
    addModal({
      message: t("areYouSureLogout"),
      actions: [
        {
          text: t("logout"),
          type: "error",
          fn: () => {
            history.push("/users/logout");
          },
        },
      ],
    });
  }

  useEscape(() => {
    let el = document.getElementById(
      "modal-circle-loop"
    ) as HTMLInputElement | null;
    if (el && el.checked) {
      el.checked = false;
    }
  });

  const isChainAdmin = useMemo(
    () => !!authUser?.chains.find((uc) => uc.is_chain_admin),
    [authUser]
  );

  if (!authUser) return null;
  return (
    <>
      <Helmet>
        <title>The Clothing Loop | Account</title>
        <meta name="description" content="Account" />z
      </Helmet>
      <main>
        <section className="bg-teal-light mb-6">
          <div className="relative container mx-auto px-5 md:px-20">
            <div className="z-10 flex flex-col items-between py-8">
              <div className="flex-grow max-w-screen-xs">
                <h1 className="font-serif font-bold text-4xl text-secondary mb-3">
                  {t("helloN", { n: authUser.name })}
                </h1>
                <p className="mb-6">
                  {t("thankYouForBeingHere")}
                  <br />
                  <br />
                  {t("goToTheToolkitFolder")}
                </p>
              </div>

              {authUser.is_root_admin || isChainAdmin ? (
                <div className="flex flex-col sm:flex-row flex-wrap rtl:sm:-mr-4">
                  <Link
                    className="btn btn-primary h-auto mb-4 sm:mr-4 text-black"
                    target="_blank"
                    to={{
                      pathname:
                        "https://drive.google.com/drive/folders/1iMJzIcBxgApKx89hcaHhhuP5YAs_Yb27",
                    }}
                  >
                    {t("toolkitFolder")}
                    <span className="feather feather-external-link ml-2 rtl:ml-0 rtl:mr-2"></span>
                  </Link>
                </div>
              ) : null}
              <div className="flex flex-col sm:flex-row flex-wrap rtl:sm:-mr-4">
                <Link
                  className="btn btn-sm btn-secondary btn-outline bg-white mb-4 sm:mr-4"
                  to="/users/me/edit"
                >
                  {t("editAccount")}
                  <span className="feather feather-edit ml-2 rtl:ml-0 rtl:mr-2"></span>
                </Link>
                <button
                  className="btn btn-sm btn-secondary btn-outline bg-white h-auto mb-4 sm:mr-4 text-black group"
                  onClick={logoutClicked}
                >
                  {t("logout")}
                  <span className="feather feather-log-out text-red group-hover:text-white ml-2 rtl:ml-0 rtl:mr-2"></span>
                </button>

                <button
                  className="btn btn-sm btn-error btn-outline bg-white/60 mb-4 sm:mr-4"
                  onClick={deleteClicked}
                >
                  <span className="text-danger">{t("deleteUserBtn")}</span>
                  <span className="feather feather-alert-octagon ml-2 rtl:ml-0 rtl:mr-2"></span>
                </button>
              </div>
            </div>
            <label
              htmlFor="modal-circle-loop"
              className="z-0 hidden lg:flex absolute top-0 right-0 rtl:right-auto rtl:left-0 bottom-0 h-full cursor-zoom-in overflow-hidden aspect-[4/3]"
            >
              <img
                className="h-full hover:scale-105 transition-transform object-cover self-center cursor-zoom-in"
                src="https://images.clothingloop.org/cx164,cy1925,cw4115,ch3086,x640/circle_loop.jpg"
              />
            </label>
          </div>
          <input
            type="checkbox"
            id="modal-circle-loop"
            className="modal-toggle"
          />
          <div className="modal">
            <label
              className="relative max-w-[100vw] max-h-[100vh] h-full justify-center items-center flex cursor-zoom-out"
              aria-label="close"
              htmlFor="modal-circle-loop"
            >
              <div className="btn btn-sm btn-square absolute right-2 top-2 feather feather-x"></div>
              <img
                className="max-h-full"
                src="https://images.clothingloop.org/x1080/circle_loop.jpg"
              />
            </label>
          </div>
        </section>
        <ChainsList chains={chains} setChains={setChains} />
      </main>
    </>
  );
}
