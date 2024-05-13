import { type TFunction } from "i18next";
import { useRef, type UIEvent, useEffect, type RefObject } from "react";
import { useDebouncedCallback } from "use-debounce";
import { TermsOfHostsHTML } from "../pages/TermsOfHosts";
import { userUpdate } from "../../../api/user";
import { UserRefreshState, authUserRefresh } from "../../../stores/auth";
import { type Modal } from "../../../stores/toast";
import type { User } from "../../../api/types";
import { DataProcessingAgreementHTML } from "../pages/DataProcessingAgreement";

interface Props {
  t: TFunction;
  authUserRefresh: () => Promise<UserRefreshState>;
  addModal: (t: Modal) => void;
  authUser: User;
  tmpAcceptedToh: boolean;
  setTmpAcceptedToh: (s: boolean) => void;
}

export default function PopupLegal({
  t,
  addModal,
  authUser,
  tmpAcceptedToh,
  setTmpAcceptedToh,
}: Props) {
  return addModal({
    message: "",
    content: () => {
      const refTohScroll = useRef<HTMLDivElement>(null);
      const refRoot = useRef<HTMLDivElement>(null);
      const refDpaScroll = useRef<HTMLDivElement>(null);
      const getElBtn = () =>
        refRoot.current?.parentElement?.querySelectorAll(
          "&>div:nth-child(3) > button",
        ) as NodeListOf<HTMLButtonElement>;
      const scrollingCheck = useDebouncedCallback(
        (e: UIEvent<HTMLDivElement>) => {
          let target = e.target as HTMLDivElement;
          // if scrolled to the bottom of the page
          if (
            target.scrollTop + target.clientHeight + 200 >
            target.scrollHeight
          ) {
            getElBtn().forEach((el) => el.removeAttribute("disabled"));
          }
        },
        300,
        {
          trailing: true,
        },
      );

      useEffect(() => {
        getElBtn().forEach((el) => el.setAttribute("disabled", "disabled"));
      }, []);

      const scrollDown = (ref: RefObject<HTMLDivElement>) => {
        ref.current?.scrollTo({
          top: ref.current!.scrollHeight,
          left: 0,
          behavior: "smooth",
        });
      };
      const scrollDownToh = () => scrollDown(refTohScroll);
      const scrollDownDpa = () => scrollDown(refDpaScroll);

      let showToh = !(authUser.accepted_toh || tmpAcceptedToh);
      let showDpa = showToh ? false : authUser.accepted_dpa === false;
      return (
        <div ref={refRoot}>
          {showToh ? (
            <>
              <h1 className="-mt-6 mb-4">{t("acceptTohTitle")}</h1>
              <p className="mb-4 text-sm">{t("acceptTohSubtitle")}</p>

              <div className="relative">
                <div
                  ref={refTohScroll}
                  className="border border-grey overflow-y-auto h-[33.333vh] text-xs py-0.5 px-2 bg-grey-light"
                  onScroll={scrollingCheck}
                >
                  <TermsOfHostsHTML className="prose text-xs prose-terms-modal" />
                </div>
                <button
                  onClick={scrollDownToh}
                  className="absolute bottom-2 ltr:right-2 rtl:left-2 btn btn-circle btn-sm btn-secondary text-white opacity-50 hover:opacity-90 tooltip ltr:tooltip-left rtl:tooltip-right before:font-normal before:text-sm"
                  data-tip="Scroll to the bottom."
                >
                  <span className="icon-arrow-down font-bold" />
                </button>
              </div>
            </>
          ) : null}
          {showDpa ? (
            <>
              <h1 className="-mt-6 mb-4">{t("acceptDpaTitle")}</h1>
              <p className="mb-4 text-sm">{t("acceptTohSubtitle")}</p>
              <div className="relative">
                <div
                  ref={refDpaScroll}
                  className="border border-grey overflow-y-auto h-[33.333vh] text-xs py-0.5 px-2 bg-grey-light"
                  onScroll={scrollingCheck}
                >
                  <DataProcessingAgreementHTML
                    authUser={authUser}
                    className="prose text-xs prose-terms-modal"
                  />
                </div>
                <button
                  onClick={scrollDownDpa}
                  className="absolute bottom-2 ltr:right-2 rtl:left-2 btn btn-circle btn-sm btn-secondary text-white opacity-50 hover:opacity-90 tooltip ltr:tooltip-left rtl:tooltip-right before:font-normal before:text-sm"
                  data-tip="Scroll to the bottom."
                >
                  <span className="icon-arrow-down font-bold" />
                </button>
              </div>
            </>
          ) : null}
          <p className="text-xs mt-3 leading-relaxed">
            {showToh
              ? t("youMustScrollToAcceptToh")
              : t("youMustScrollToAcceptDpa")}
            <br />
            <span className="text-red font-semibold">
              {t("ifClickDenyTohSetHost")}
            </span>
          </p>
        </div>
      );
    },
    actions: [
      {
        type: "primary",
        text: t("accept"),
        fn: () => {
          if (
            authUser.accepted_toh === false &&
            tmpAcceptedToh === false &&
            authUser.accepted_dpa === false
          ) {
            setTmpAcceptedToh(true);
            authUserRefresh(true);
            return;
          }
          userUpdate({
            user_uid: authUser.uid,
            accepted_legal: true,
          }).then(() => {
            setTmpAcceptedToh(true);
            authUserRefresh(true);
          });
        },
        submit: true,
      },
      {
        type: "error",
        text: t("deny"),
        fn: () => {
          if (
            confirm(
              t("areYouSureRevokeHost", { name: authUser.name }) as string,
            )
          ) {
            userUpdate({
              user_uid: authUser.uid,
              accepted_legal: false,
            }).then(() => {
              authUserRefresh(true);
            });
          }
        },
        submit: true,
      },
    ],
    forceOpen: true,
  });
}
