//Resources
import { Link, Redirect, useHistory } from "react-router-dom";
import { useContext } from "react";
import { useTranslation } from "react-i18next";
import { Helmet } from "react-helmet";

import { TwoColumnLayout } from "../components/Layouts";
import { AuthContext } from "../providers/AuthProvider";
import { userPurge } from "../api/user";
import { ToastContext } from "../providers/ToastProvider";
import ChainsList from "../components/ChainsList";

export default function AdminDashboard() {
  const { t } = useTranslation();
  const { authUser } = useContext(AuthContext);

  const history = useHistory();
  const { addToastStatic } = useContext(ToastContext);
  function deleteClicked() {
    addToastStatic({
      message: t("deleteAccount"),
      type: "warning",
      actions: [
        {
          text: t("delete"),
          type: "ghost",
          fn: () => {
            userPurge(authUser!.uid);
            history.push("/users/logout");
          },
        },
      ],
    });
  }

  if (!authUser) return null;

  return (
    <>
      <Helmet>
        <title>The Clothing Loop | Account</title>
        <meta name="description" content="Account" />z
      </Helmet>
      <main className="">
        <section className="bg-teal-light mb-6">
          <div className="container mx-auto flex items-stretch justify-between px-5 md:px-20">
            <div className="flex flex-col items-between py-8">
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

                <Link
                  className="btn btn-secondary btn-outline bg-white mb-4 sm:mr-4"
                  to={`/users/${authUser.uid}/edit`}
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
            <img
              className="hidden lg:block h-64 w-64 my-6 rounded-full object-cover self-center"
              src="https://ucarecdn.com/6ac2be4c-b2d6-4303-a5a0-c7283759a8e9/-/scale_crop/256x256/smart/-/format/auto/-/quality/smart/denise.png"
            />
          </div>
        </section>
        <ChainsList />
      </main>
    </>
  );
}
