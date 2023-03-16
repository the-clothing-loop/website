//Resources
import { Link, useHistory } from "react-router-dom";
import { useContext, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Helmet } from "react-helmet";

import { AuthContext } from "../providers/AuthProvider";
import { userPurge } from "../api/user";
import { ToastContext } from "../providers/ToastProvider";
import ChainsList from "../components/ChainsList";
import { useEscape } from "../util/escape.hooks";

export default function AdminDashboard() {
  const { t } = useTranslation();
  const { authUser } = useContext(AuthContext);
  const { addModal } = useContext(ToastContext);
  const history = useHistory();

  function deleteClicked() {
    addModal({
      message: t("deleteAccount"),
      actions: [
        {
          text: t("delete"),
          type: "error",
          fn: () => {
            userPurge(authUser!.uid);
            history.push("/users/logout");
          },
        },
      ],
    });
  }

  if (!authUser) return null;

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

  return (
    <>
      <Helmet>
        <title>The Clothing Loop | Account</title>
        <meta name="description" content="Account" />z
      </Helmet>
      <main className="">
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

              <div className="flex flex-col sm:flex-row flex-wrap">
                {authUser.is_root_admin || isChainAdmin ? (
                  <Link
                    className="btn btn-primary h-auto mb-4 sm:mr-4 text-black"
                    target="_blank"
                    to={{
                      pathname:
                        "https://drive.google.com/drive/folders/1iMJzIcBxgApKx89hcaHhhuP5YAs_Yb27",
                    }}
                  >
                    {t("toolkitFolder")}
                    <span className="feather feather-external-link ml-2"></span>
                  </Link>
                ) : null}

                <Link
                  className="btn btn-secondary btn-outline bg-white mb-4 sm:mr-4"
                  to="/users/me/edit"
                >
                  {t("editAccount")}
                  <span className="feather feather-edit ml-2"></span>
                </Link>

                <button
                  className="btn btn-error btn-outline bg-white mb-4 sm:mr-4"
                  onClick={deleteClicked}
                >
                  <span className="text-black">{t("deleteUserBtn")}</span>
                  <span className="feather feather-alert-octagon ml-2"></span>
                </button>
              </div>
            </div>
            <label
              htmlFor="modal-circle-loop"
              className="z-0 hidden lg:flex absolute top-0 right-0 bottom-0 h-full cursor-zoom-in overflow-hidden aspect-[4/3]"
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
            <div className="relative max-w-[100vw] max-h-[100vh] h-full justify-center items-center flex">
              <label
                htmlFor="modal-circle-loop"
                aria-label="close"
                className="btn btn-sm btn-square absolute right-2 top-2 feather feather-x"
              ></label>
              <img
                className="max-h-full"
                src="https://images.clothingloop.org/x1080/circle_loop.jpg"
              />
            </div>
          </div>
        </section>
        <ChainsList />
      </main>
    </>
  );
}
