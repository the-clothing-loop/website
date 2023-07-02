import {
  useState,
  useContext,
  useEffect,
  MouseEvent,
  Dispatch,
  SetStateAction,
} from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Cookies from "js-cookie";

import { AuthContext } from "../providers/AuthProvider";
import {
  chainGet,
  chainGetAll,
  chainPoke,
  chainRemoveUser,
} from "../api/chain";
import { Chain, UID } from "../api/types";
import { ToastContext } from "../providers/ToastProvider";
import { GinParseErrors } from "../util/gin-errors";
import dayjs from "../util/dayjs";

interface Props {
  chains: Chain[];
  setChains: Dispatch<SetStateAction<Chain[]>>;
}

export default function ChainsList({ chains, setChains }: Props) {
  const { t } = useTranslation();
  const { authUser, authUserRefresh } = useContext(AuthContext);
  const { addToastError, addModal, addToast } = useContext(ToastContext);
  const [isPokeable, setIsPokeable] = useState(false);

  useEffect(() => {
    load();
  }, [authUser]);

  async function load() {
    if (authUser) {
      try {
        let _chains: Chain[];
        if (authUser.is_root_admin) {
          _chains = (await chainGetAll({ filter_out_unpublished: false })).data;
        } else {
          let data = await Promise.all(
            authUser.chains.map((uc) => chainGet(uc.chain_uid, true))
          );
          _chains = data.map((d) => d.data);
        }
        setChains(_chains.sort((a, b) => a.name.localeCompare(b.name)));
      } catch (err: any) {
        console.error("Unable to load chains", err);
        addToastError(GinParseErrors(t, err), err.status);
      }

      setIsPokeable(!(Cookies.get("poke") === authUser.uid));
    }
  }

  function handleClickPoke(e: MouseEvent, chainUID: UID) {
    e.preventDefault();

    chainPoke(chainUID)
      .then((res) => {
        addToast({ type: "success", message: t("reminderEmailSent") });
        Cookies.set("poke", authUser!.uid, { expires: 7 });
        setIsPokeable(false);
      })
      .catch((err) => {
        addToastError(GinParseErrors(t, err), err.status);
        if (err.status === 429) {
          // hide for a day
          Cookies.set("poke", authUser!.uid, { expires: 1 });
          setIsPokeable(false);
        }
      });
  }

  function handleClickUnsubscribe(e: MouseEvent, chain: Chain) {
    e.preventDefault();
    addModal({
      message: t("areYouSureLeaveLoop", {
        name: authUser?.name,
        chain: chain.name,
      }),
      actions: [
        {
          text: t("leave"),
          type: "error",
          fn: () => {
            chainRemoveUser(chain.uid, authUser!.uid)
              .catch((err: any) => {
                console.error(
                  "Unable to unsubscribe from Loop",
                  err,
                  chain.uid,
                  chain.name
                );
                addToastError(GinParseErrors(t, err), err.status);
              })
              .finally(() => {
                authUserRefresh();
              });
          },
        },
      ],
    });
  }

  return (
    <div
      className={`container mx-auto -mb-8 lg:-mb-16 ${
        chains ? "" : "animate-pulse"
      }`}
    >
      <div className="flex flex-row px-4 md:px-20 py-4">
        <h2 className="text-2xl font-bold mb-3">{`${
          chains?.length || 0
        } Clothing Loops`}</h2>
      </div>

      <div className="overflow-x-auto pb-36">
        <table className="table table-compact w-full">
          <thead>
            <tr>
              <th align="left" className="max-xs:w-full">
                {t("name")}
              </th>
              <th align="left" className="max-xs:hidden">
                {t("location")}
              </th>
              <th align="center" className="max-xs:hidden">
                {t("status")}
              </th>
              <th align="right" />
            </tr>
          </thead>
          <tbody>
            {chains
              ?.sort((a, b) => a.name.localeCompare(b.name))
              .map((chain) => {
                let userChain = authUser?.chains.find(
                  (uc) => uc.chain_uid === chain.uid
                );
                let isUserAdmin = userChain?.is_chain_admin || false;
                let userChainPokeable =
                  isPokeable &&
                  userChain?.is_approved === false &&
                  dayjs(userChain.created_at).isBefore(
                    dayjs().subtract(7, "days")
                  );

                return (
                  <tr
                    key={chain.uid}
                    className="[&_td]:hover:bg-base-200/[0.6] [&_td]:focus:bg-primary/[0.3]"
                    tabIndex={-1}
                  >
                    <td className="font-bold w-32 whitespace-normal">
                      {chain.name}
                    </td>
                    <td
                      align="left"
                      className="whitespace-normal max-xs:hidden"
                    >
                      {chain.address}
                    </td>
                    <td align="center" className="max-xs:hidden">
                      {userChain?.is_approved ||
                      (!userChain && authUser?.is_root_admin) ? (
                        chain.published ? (
                          <div className="tooltip" data-tip="published">
                            <span className="feather feather-eye text-lg text-green" />
                          </div>
                        ) : (
                          <div className="tooltip" data-tip="draft">
                            <span className="feather feather-eye-off text-lg text-red" />
                          </div>
                        )
                      ) : (
                        <div
                          className="tooltip"
                          data-tip={t("pendingApproval")}
                        >
                          <span className="feather btn-circle btn-lg feather-user-check text-yellow-darkest" />
                        </div>
                      )}
                    </td>
                    <td align="right">
                      <div className="flex justify-end">
                        {(isUserAdmin && userChain?.is_approved) ||
                        authUser?.is_root_admin ? (
                          <Link
                            className={`btn btn-primary justify-between sm:w-28 max-xs:btn-sm ${
                              chains?.length > 5 ? "btn-sm" : ""
                            }`}
                            to={`/loops/${chain.uid}/members`}
                          >
                            <span className="max-xs:hidden">{t("view")}</span>
                            <span className="feather feather-arrow-left sm:mr-3 ltr:hidden"></span>
                            <span className="feather feather-arrow-right sm:ml-3 rtl:hidden"></span>
                          </Link>
                        ) : null}
                        <div className="dropdown dropdown-left">
                          <label
                            tabIndex={0}
                            className={`btn btn-ghost max-xs:btn-sm ${
                              chains?.length > 5 ? "btn-sm" : ""
                            } ${userChain ? "" : "btn-disabled"}`}
                          >
                            <span className="text-xl feather feather-more-vertical" />
                          </label>
                          {userChain ? (
                            <ul
                              tabIndex={0}
                              className={`dropdown-content menu shadow bg-base-100 w-64 ${
                                isUserAdmin ? "h-full" : ""
                              }`}
                            >
                              <li
                                className={isUserAdmin ? "h-full" : ""}
                                key="leave"
                              >
                                <a
                                  className={`text-red font-bold ${
                                    isUserAdmin ? "h-full" : ""
                                  }`}
                                  href="#"
                                  onClick={(e) =>
                                    handleClickUnsubscribe(e, chain)
                                  }
                                >
                                  {userChain?.is_approved
                                    ? t("leaveLoop")
                                    : t("leaveWaitlist")}
                                </a>
                              </li>
                              {isUserAdmin ? null : userChainPokeable ? (
                                <li key="poke">
                                  <a
                                    className="font-bold"
                                    href="#"
                                    onClick={(e) =>
                                      handleClickPoke(e, chain.uid)
                                    }
                                  >
                                    {t("remindHost")}
                                  </a>
                                </li>
                              ) : (
                                <li
                                  key="no-poke"
                                  className="disabled whitespace-normal text-left cursor-not-allowed"
                                >
                                  <span className="block !text-black">
                                    <span className="block pb-1 font-bold">
                                      <span className="opacity-50">
                                        {t("remindHost")}
                                      </span>
                                      <i className="feather feather-slash ml-1 rtl:ml-0 rtl:mr-1"></i>
                                    </span>
                                    <span
                                      className="text-xs"
                                      dangerouslySetInnerHTML={{
                                        __html: t("waitToRemindHost"),
                                      }}
                                    ></span>
                                  </span>
                                </li>
                              )}
                            </ul>
                          ) : null}
                        </div>
                      </div>
                    </td>
                  </tr>
                );
              })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
