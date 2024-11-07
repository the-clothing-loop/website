import { useMemo } from "react";
import type { User, Chain } from "../../../../api/types";
import { $authUser, authUserRefresh } from "../../../../stores/auth";

import { addModal, addToastError } from "../../../../stores/toast";
import { chainAddUser } from "../../../../api/chain";

// import sanitizeHtml from "sanitize-html";
import { GinParseErrors } from "../../util/gin-errors";
import { SizeBadges } from "../Badges";
import { useStore } from "@nanostores/react";
import { useTranslation } from "react-i18next";
import useLocalizePath from "../../util/localize_path.hooks";
import ChainDescription from "./ChainDescription";
// import type { StringMap, TOptions } from "i18next";

enum ListChainType {
  Focused,
  MapClicked,
  Visible,
}

interface ListCItem {
  c: Chain;
  t: ListChainType;
}

interface SideBarProps {
  mapClickedChains: Chain[];
  visibleChains: Chain[];
  focusedChain: Chain | null;
  setFocusedChain: (chain: Chain | null) => void;
  open: boolean;
  setOpen: (s: boolean) => void;
}

export default function SideBar({
  mapClickedChains,
  visibleChains,
  focusedChain,
  setFocusedChain,
  open,
  setOpen,
}: SideBarProps) {
  const authUser = useStore($authUser);

  const { t, i18n } = useTranslation();
  const localizePath = useLocalizePath(i18n);

  function handleClose() {
    setFocusedChain(null);

    setOpen(false);
  }
  function handleClickViewChain(chain: Chain) {
    window.location.href = localizePath("/loops/members/?chain=" + chain.uid);
  }
  function handleClickFocusChain(chain: Chain) {
    setFocusedChain(chain);
  }

  function handleClickJoin(chain: Chain) {
    if (authUser && chain.uid) {
      addModal({
        message: t("AreYouSureJoinLoop", {
          chainName: chain.name,
          interpolation: {
            escapeValue: false,
          },
        }),
        actions: [
          {
            text: t("join"),
            type: "secondary",
            fn: () => {
              chainAddUser(chain.uid, authUser.uid, false)
                .then(() => {
                  authUserRefresh(true);
                  window.location.href = localizePath("/thankyou");
                })
                .catch((err) => {
                  addToastError(GinParseErrors(t, err), err?.status);
                });
            },
          },
        ],
      });
    } else {
      window.location.href = localizePath(
        "/loops/users/signup/?chain=" + chain.uid,
      );
    }
  }

  const listChains = useMemo(() => {
    const list = [] as ListCItem[];

    console.log(
      "mapClickedChainUIDs: %s\tvisibleChains: %s",
      mapClickedChains.map((c) => c.uid).join(", "),
      visibleChains.map((c) => c.uid).join(", "),
    );

    const uniqueVisibleChains = visibleChains.filter(
      (c) => !mapClickedChains.find((c2) => c2.uid === c.uid),
    );
    list.push(
      ...mapClickedChains.map((c) => ({
        c,
        t:
          c.uid === focusedChain?.uid
            ? ListChainType.Focused
            : ListChainType.MapClicked,
      })),
    );
    list.push(
      ...uniqueVisibleChains.map((c) => ({
        c,
        t:
          c.uid === focusedChain?.uid
            ? ListChainType.Focused
            : ListChainType.Visible,
      })),
    );

    return list;
  }, [mapClickedChains, visibleChains, focusedChain]);

  return (
    <div
      className={`z-10 absolute w-full sm:w-72 top-0 left-0 right-0 max-h-[90%] sm:max-h-full sm:right-auto
        glass sm:bg-transparent shadow-lg sm:shadow-none
         overflow-auto `.concat(open ? "" : "hidden")}
      tabIndex={-1}
    >
      <form className="w-full z-10">
        <div className="sticky z-10 top-0" key="title">
          <div className="text-xs bg-grey/20 p-1 text-center font-semibold">
            {t("selectLoop")}
          </div>

          <button
            key="close"
            type="button"
            data-tip={t("close")}
            onClick={handleClose}
            className="absolute top-0 sm:top-2 right-2 rtl:right-auto rtl:left-2 btn btn-md sm:btn-sm text-2xl btn-circle btn-accent tooltip tooltip-left flex justify-center"
          >
            <span className="icon-arrow-left hidden sm:ltr:block"></span>
            <span className="icon-arrow-right hidden sm:rtl:block"></span>
            <span className="icon-x sm:hidden"></span>
          </button>
        </div>

        <div>
          {listChains.map((item) => (
            <SideBarChainItem
              chain={item.c}
              authUser={authUser}
              onClickJoin={handleClickJoin}
              onClickViewChain={handleClickViewChain}
              onClickFocusChain={handleClickFocusChain}
              key={item.c.uid}
              type={item.t}
            />
          ))}
        </div>
      </form>
    </div>
  );
}

function SideBarChainItem(props: {
  chain: Chain;
  authUser: User | null | undefined;
  onClickJoin: (c: Chain) => void;
  onClickViewChain: (c: Chain) => void;
  onClickFocusChain: (c: Chain) => void;
  type: ListChainType;
}) {
  const handleClickEnlarge = () => props.onClickFocusChain(props.chain);
  const handleClickViewChain = () => props.onClickViewChain(props.chain);
  const handleClickJoin = () => props.onClickJoin(props.chain);

  const { t } = useTranslation();

  const userChain = props.authUser?.chains.find(
    (uc) => uc.chain_uid === props.chain.uid,
  );

  if (props.type === ListChainType.Visible) {
    return (
      <button
        className="w-full p-1.5 hidden sm:block border-b border-grey/10 last:border-none text-secondary text-ellipsis overflow-hidden whitespace-nowrap glass cursor-pointer"
        key={props.chain.uid}
        type="button"
        onClick={() => props.onClickFocusChain(props.chain)}
      >
        {props.chain.name}
      </button>
    );
  }

  let isLarge = props.type === ListChainType.Focused;

  return (
    <div
      className={"p-4 w-full my-1 bg-white sm:shadow-md ".concat(
        isLarge ? "" : "hover:opacity-80 cursor-pointer",
      )}
      key={props.chain.uid}
      onClick={isLarge ? undefined : handleClickEnlarge}
      tabIndex={isLarge ? undefined : -1}
    >
      <div className="sm:mb-2">
        <h1 className="font-semibold text-secondary mb-3 pe-10 break-words">
          {props.chain.name}
        </h1>

        {props.chain.description && isLarge ? (
          <ChainDescription description={props.chain.description} />
        ) : null}

        <div
          className={"transition-all overflow-hidden ".concat(
            isLarge ? "h-auto" : "h-0",
          )}
        >
          <div>
            <div className="flex flex-col w-full text-sm">
              {props.chain.sizes?.length || props.chain.genders?.length ? (
                <>
                  <h2 className="mb-1">{t("sizes")}:</h2>
                  <div className="mb-2">
                    <SizeBadges s={props.chain.sizes} g={props.chain.genders} />
                  </div>
                </>
              ) : null}
            </div>
            <div className="flex flex-col items-start">
              {props.authUser?.is_root_admin || userChain?.is_chain_admin ? (
                <button
                  type="button"
                  key={"btn-view"}
                  className="btn btn-sm btn-secondary btn-outline mb-3"
                  onClick={handleClickViewChain}
                >
                  {t("viewLoop")}
                  <span className="icon-shield ml-3"></span>
                </button>
              ) : null}
            </div>
          </div>
        </div>

        {userChain ? (
          userChain.is_approved ? (
            <p className="bg-primary px-3 font-semibold text-sm border border-primary h-8 inline-flex items-center">
              {t("joined")}
              <span className="icon-check ml-3"></span>
            </p>
          ) : (
            <p className="px-3 font-semibold text-sm border border-secondary h-8 inline-flex items-center text-secondary">
              {t("pendingApproval")}
              <span className="icon-user-check ml-3"></span>
            </p>
          )
        ) : props.chain.open_to_new_members ? (
          isLarge ? (
            <button
              onClick={handleClickJoin}
              type="button"
              className="btn btn-sm btn-primary"
            >
              {t("join")}
              <span className="icon-arrow-right ml-3 rtl:hidden"></span>
              <span className="icon-arrow-left mr-3 ltr:hidden"></span>
            </button>
          ) : (
            <p className="bg-primary px-3 font-semibold text-sm border border-primary h-8 inline-flex items-center">
              {t("join")}
            </p>
          )
        ) : (
          <p className="px-3 font-semibold text-sm border border-secondary h-8 inline-flex items-center text-secondary">
            {t("closed")}
            <span className="icon-lock ms-3"></span>
          </p>
        )}
      </div>
    </div>
  );
}
