import {
  useState,
  useEffect,
  type MouseEvent,
  type Dispatch,
  type SetStateAction,
} from "react";

import { $authUser, authUserRefresh } from "../../../stores/auth";
import {
  chainGet,
  chainGetAll,
  chainPoke,
  chainRemoveUser,
} from "../../../api/chain";
import type { Chain, UID } from "../../../api/types";
import { addModal, addToast, addToastError } from "../../../stores/toast";
import { GinParseErrors } from "../util/gin-errors";
import dayjs from "../util/dayjs";
import useToClipboard from "../util/to-clipboard.hooks";
import { useStore } from "@nanostores/react";
import { useTranslation } from "react-i18next";
import useLocalizePath from "../util/localize_path.hooks";
import { cookiePoke } from "../../../stores/browser_storage";

const PUBLIC_BASE_URL = import.meta.env.PUBLIC_BASE_URL;

interface Props {
  chains: Chain[];
  setChains: Dispatch<SetStateAction<Chain[]>>;
}

export default function ChainsList({ chains, setChains }: Props) {
  const { t, i18n } = useTranslation();
  const localizePath = useLocalizePath(i18n);
  const authUser = useStore($authUser);
  const [isPokeable, setIsPokeable] = useState(false);
  const addCopyAttributes = useToClipboard();

  useEffect(() => {
    load();
  }, [authUser]);

  async function load() {
    if (authUser) {
      try {
        let _chains: Chain[];
        if (authUser.is_root_admin) {
          _chains = (
            await chainGetAll({
              filter_out_unpublished: false,
              add_rules: true,
              add_headers: true,
              add_totals: true,
            })
          ).data;
        } else {
          let data = await Promise.all(
            authUser.chains.map((uc) =>
              chainGet(uc.chain_uid, { addTotals: true }),
            ),
          );
          _chains = data.map((d) => d.data);
        }
        setChains(_chains.sort((a, b) => a.name.localeCompare(b.name)));
      } catch (err: any) {
        console.error("Unable to load chains", err);
        addToastError(GinParseErrors(t, err), err.status);
      }

      setIsPokeable(!(cookiePoke.get() === authUser.uid));
    }
  }

  function handleClickPoke(e: MouseEvent, chainUID: UID) {
    e.preventDefault();
    if (!authUser) return;

    chainPoke(chainUID)
      .then(() => {
        addToast({ type: "success", message: t("reminderEmailSent") });
        cookiePoke.set(authUser.uid, 7);
        setIsPokeable(false);
      })
      .catch((err) => {
        addToastError(GinParseErrors(t, err), err.status);
        if (err.status === 429) {
          // hide for a day
          cookiePoke.set(authUser.uid, 1);
          setIsPokeable(false);
        }
      });
  }

  function handleClickUnsubscribe(e: MouseEvent, chain: Chain) {
    e.preventDefault();
    if (!authUser) return;
    addModal({
      message: t("areYouSureLeaveLoop", {
        name: authUser.name,
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
                  chain.name,
                );
                addToastError(GinParseErrors(t, err), err.status);
              })
              .finally(() => {
                authUserRefresh(true);
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

      <div className="mb-20 border-b-2 border-base-200">
        <table className="table table-compact w-full">
          <thead>
            <tr>
              <th align="left" className="max-xs:w-full">
                {t("name")}
              </th>
              <th align="left" className="max-xs:hidden">
                {t("location")}
              </th>
              <th align="right" className="max-xs:hidden">
                {t("members")}
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
                if (!authUser) return null;
                let userChain = authUser.chains.find(
                  (uc) => uc.chain_uid === chain.uid,
                );
                let isUserAdmin = userChain?.is_chain_admin || false;
                let userChainPokeable =
                  isPokeable &&
                  userChain?.is_approved === false &&
                  dayjs(userChain.created_at).isBefore(
                    dayjs().subtract(7, "days"),
                  );
                const shareLink =
                  PUBLIC_BASE_URL +
                  localizePath("/loops/users/signup/?chain=" + chain.uid);
                let hasNotification = authUser.notification_chain_uids?.length
                  ? !!authUser.notification_chain_uids.find(
                      (uid) => chain.uid === uid,
                    )
                  : false;

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
                    <td
                      align="right"
                      className="whitespace-normal max-xs:hidden font-mono"
                    >
                      {userChain?.is_approved || authUser.is_root_admin ? (
                        <>
                          <span>{chain.total_members}</span>
                          {authUser.is_root_admin ? (
                            <span className="inline-block ms-2">
                              {"(" + chain.total_hosts + ")"}
                            </span>
                          ) : null}
                        </>
                      ) : (
                        "-"
                      )}
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
                          <a
                            className={`btn btn-primary justify-between relative sm:w-28 max-xs:btn-sm ${
                              chains?.length > 5 ? "btn-sm" : ""
                            }`}
                            href={localizePath(
                              "/loops/members/?chain=" + chain.uid,
                            )}
                          >
                            <span className="max-xs:hidden">{t("view")}</span>
                            <span className="feather feather-arrow-left sm:mr-3 ltr:hidden"></span>
                            <span className="feather feather-arrow-right sm:ml-3 rtl:hidden"></span>
                            {hasNotification ? (
                              <div className="block bg-red rounded-full w-3.5 h-3.5 absolute -top-1.5 -right-1.5"></div>
                            ) : null}
                          </a>
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
                              className="dropdown-content menu shadow bg-base-100 w-64"
                            >
                              <li key="share">
                                <a
                                  {...addCopyAttributes(
                                    t,
                                    "loop-share-" + chain.uid,
                                    "font-bold text-start",
                                    shareLink,
                                  )}
                                  href={shareLink}
                                >
                                  {t("shareLink")}
                                  <small className="ms-2 font-bold text-base-300">
                                    {t("copy")}
                                  </small>
                                </a>
                              </li>
                              <li key="leave">
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
                                        __html: t("waitToRemindHost")!,
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
