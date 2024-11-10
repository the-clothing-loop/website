import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useStore } from "@nanostores/react";

import { userPurge } from "../../../api/user";
import ChainsList from "../components/ChainsList";
import { useEscape } from "../util/escape.hooks";
import type { Chain } from "../../../api/types";
import { $authUser } from "../../../stores/auth";
import { addModal, addToastError } from "../../../stores/toast";
import useLocalizePath from "../util/localize_path.hooks";
import { useLegal } from "../util/user.hooks";
import { GinParseErrors } from "../util/gin-errors";
import DeleteModal from "../components/DeleteModal";

export default function AdminDashboard() {
  const { t, i18n } = useTranslation();
  const localizePath = useLocalizePath(i18n);
  const authUser = useStore($authUser);

  const [chains, setChains] = useState<Chain[]>([]);

  const isChainAdmin = useMemo(
    () => !!authUser?.chains.find((uc) => uc.is_chain_admin),
    [authUser],
  );
  const reasonsForLeaving = useRef<string[]>([]);

  const handleSelectReasons = (selectedReasons: string[]) => {
    reasonsForLeaving.current = selectedReasons;
  };

  function deleteClicked() {
    if (!authUser) return;
    const chainNames = authUser.is_root_admin
      ? undefined
      : (authUser.chains
          .filter((uc) => uc.is_chain_admin)
          .map((uc) => chains.find((c) => c.uid === uc.chain_uid))
          .filter((c) => c && c.total_hosts && !(c.total_hosts > 1))
          .map((c) => c!.name) as string[]);

    console.log(
      "show content",
      "chainNames",
      chainNames,
      "authUser.is_root_admin",
      authUser.is_root_admin,
      "authUser.chains",
      authUser.chains,
      "authUser.chains filtered",
      authUser.chains
        .filter((uc) => uc.is_chain_admin)
        .map((uc) => chains.find((c) => c.uid === uc.chain_uid)),
    );

    addModal({
      message: t("deleteAccount"),
      content: () => {
        return <DeleteModal onUpdateSelectedReasons={handleSelectReasons} />;
      },
      actions: [
        {
          text: t("delete"),
          type: "error",
          fn: () => {
            console.log(reasonsForLeaving);
            
            userPurge(authUser!.uid, reasonsForLeaving.current)
              .then(() => {
                window.location.href = localizePath("/users/logout");
              })
              .catch((err: any) => {
                console.error("Error purging user:", err);
                addToastError(GinParseErrors(t, err), err?.status);
              });
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
            window.location.href = localizePath("/users/logout");
          },
        },
      ],
    });
  }

  useLegal(t, authUser);

  useEscape(() => {
    let el = document.getElementById(
      "modal-circle-loop",
    ) as HTMLInputElement | null;
    if (el && el.checked) {
      el.checked = false;
    }
  });

  if (!authUser) {
    if (authUser === null) window.location.href = localizePath("/users/login");
    return <AdminDashboardLoading />;
  }
  return (
    <main>
      <section className="bg-teal-light mb-6">
        <div className="relative container mx-auto px-5 md:px-20">
          <div className="z-10 flex flex-col items-between py-8">
            <div className="flex-grow max-w-screen-xs">
              <span className="block mb-1 text-xs text-teal/60">
                {authUser.email}
              </span>
              <h1 className="font-serif font-bold text-4xl text-secondary mb-3">
                {t("helloN", {
                  n: authUser.name,
                  interpolation: { escapeValue: false },
                })}
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
                <a
                  className="btn btn-primary h-auto mb-4 sm:mr-4 text-black"
                  target="_blank"
                  href="https://drive.google.com/drive/folders/1iMJzIcBxgApKx89hcaHhhuP5YAs_Yb27"
                >
                  {t("toolkitFolder")}
                  <span className="icon-external-link ms-2"></span>
                </a>
              </div>
            ) : null}
            <div className="flex flex-col sm:flex-row flex-wrap rtl:sm:-mr-4">
              <a
                className="btn btn-sm btn-secondary btn-outline bg-white mb-4 sm:mr-4"
                href={localizePath("/users/edit/?user=me")}
              >
                {t("editAccount")}
                <span className="icon-pencil ms-2"></span>
              </a>
              <button
                className="btn btn-sm btn-secondary btn-outline bg-white h-auto mb-4 sm:mr-4 text-black group"
                onClick={logoutClicked}
              >
                {t("logout")}
                <span className="icon-log-out text-red group-hover:text-white ms-2"></span>
              </button>

              <button
                className=" btn btn-sm opacity-70 btn-ghost mb-4 sm:mr-4"
                onClick={deleteClicked}
              >
                <span className="">{t("deleteUserBtn")}</span>
                <span className="icon-octagon-alert ms-1 !text-red"></span>
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
            <div className="btn btn-sm btn-square absolute right-2 top-2 icon-x"></div>
            <img
              className="max-h-full"
              src="https://images.clothingloop.org/x1080/circle_loop.jpg"
            />
          </label>
        </div>
      </section>
      <ChainsList chains={chains} setChains={setChains} />
    </main>
  );
}

function AdminDashboardLoading() {
  return (
    <main>
      <section
        className="bg-teal-light"
        style={{ height: "392px", marginBottom: "300px" }}
      >
        <div className="relative container mx-auto px-5 md:px-20 animate-pulse">
          <div className="py-8 opacity-80">
            <div className="mb-3 h-4 w-36 bg-teal/40"></div>
            <div className="h-10 w-60 bg-teal mb-5"></div>
            {[300, 260, 0, 300, 200].map((v, i) => (
              <div className="bg-grey h-8" style={{ width: v }} key={i} />
            ))}
            <p className="mb-6">
              <br />
              <br />
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
