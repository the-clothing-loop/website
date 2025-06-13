import {
  useState,
  useEffect,
  useMemo,
  type JSX,
  type ChangeEvent,
  type MouseEvent,
  type MouseEventHandler,
  type ReactElement,
  lazy,
  Suspense,
  useRef,
} from "react";

import dayjs from "../util/dayjs";
import simplifyDays from "../util/simplify-days";

import { UserDataExport } from "../components/DataExport";
import {
  chainAddUser,
  chainDelete,
  chainDeleteUnapproved,
  chainGet,
  chainGetAll,
  chainRemoveUser,
  chainUpdate,
  chainUserApprove,
  UnapprovedReason,
  type ChainUpdateBody,
} from "../../../api/chain";
import type { Bag, Chain, UID, User, UserChain } from "../../../api/types";
import { userGetAllByChain, userTransferChain } from "../../../api/user";

import { SizeBadges } from "../components/Badges";
import { GinParseErrors } from "../util/gin-errors";
import {
  routeGetOrder,
  routeOptimizeOrder,
  routeSetOrder,
} from "../../../api/route";
import useToClipboard from "../util/to-clipboard.hooks";
import { bagGetAllByChain } from "../../../api/bag";
import PopoverOnHover from "../components/Popover";
import DOMPurify from "dompurify";
import isTouchDevice from "../util/is_touch";
import { useTranslation } from "react-i18next";
import getQuery from "../util/query";
import { useStore } from "@nanostores/react";
import { $authUser, authUserRefresh } from "../../../stores/auth";
import { addModal, addToastError } from "../../../stores/toast";
import useLocalizePath from "../util/localize_path.hooks";
import { loginSuperAsGenerateLink } from "../../../api/login";
import ChainDescription from "../components/FindChain/ChainDescription";
import { useLegal } from "../util/user.hooks";
import QrCode from "../components/LoopMembers/QrCode";
import ChainMemberListLoading from "../components/LoopMembers/LoopMembersLoading";
import { uploadImageFile } from "../../../api/imgbb";
import { EVENT_IMAGE_EXPIRATION } from "../../../api/event";
import OriginalImageToProxy from "../util/image_proxy";
const RouteMapPopup = lazy(
  () => import("../components/RouteMap/RouteMapPopup"),
);

enum LoadingState {
  idle,
  loading,
  error,
  success,
}

type SelectedTable = "route" | "participants" | "unapproved";

const PUBLIC_BASE_URL = import.meta.env.PUBLIC_BASE_URL;

export default function ChainMemberList() {
  const { t, i18n } = useTranslation();
  const localizePath = useLocalizePath(i18n);
  const [chainUID] = getQuery("chain");
  const authUser = useStore($authUser);
  const refFileInput = useRef<HTMLInputElement>(null);

  const [hostChains, setHostChains] = useState<Chain[]>([]);
  const [loadingTransfer] = useState(LoadingState.idle);
  const [chain, setChain] = useState<Chain | null>(null);
  const [users, setUsers] = useState<User[] | null>(null);
  const [bags, setBags] = useState<Bag[] | null>(null);
  const [route, setRoute] = useState<UID[] | null>(null);
  const [previousRoute, setPreviousRoute] = useState<UID[] | null>(null);
  const [changingPublishedAuto, setChangingPublishedAuto] = useState(false);
  const [isOpenRouteMapPopup, setIsOpenRouteMapPopup] = useState(false);

  const [participantsSortBy, setParticipantsSortBy] =
    useState<ParticipantsSortBy>("date");
  const [unapprovedUsers, setUnapprovedUsers] = useState<User[] | null>(null);
  const [published, setPublished] = useState(true);
  const [openToNewMembers, setOpenToNewMembers] = useState(true);
  const [isAppDisabled, setIsAppDisabled] = useState(false);
  const [error, setError] = useState("");
  const [selectedTable, setSelectedTable] = useState<SelectedTable>("route");
  const addCopyAttributes = useToClipboard();
  const refQrCodeDialog = useRef<HTMLDialogElement>(null);
  const [openQrCode, setOpenQrCode] = useState(false);

  const participantsSortUsers = useMemo(() => {
    if (!users || !chainUID) return [];
    const sortBy = participantsSortBy;
    let res = [...users];
    switch (sortBy) {
      case "email":
      case "name":
        res = res.sort((a, b) =>
          a[sortBy]!.localeCompare(b[sortBy]!) == 1 ? 1 : -1,
        );
        break;
      case "date":
        res = res.sort((a, b) => {
          const ucA = getUserChain(a, chainUID);
          const ucB = getUserChain(b, chainUID);

          return new Date(ucA.created_at) > new Date(ucB.created_at) ? -1 : 1;
        });
    }
    return res;
  }, [users, participantsSortBy]);

  const routeSortUsers = useMemo(() => {
    if (!users || !route) return [];
    let res = [...users];
    return res.sort((a, b) =>
      route.indexOf(a.uid) < route.indexOf(b.uid) ? -1 : 1,
    );
  }, [users, route]);

  useLegal(t, authUser);

  async function handleChangePublished(e: ChangeEvent<HTMLInputElement>) {
    let isChecked = e.target.checked;
    let oldValue = published;
    let oldValueOpenToNewMembers = openToNewMembers;
    setPublished(isChecked);
    if (!isChecked) {
      setOpenToNewMembers(isChecked);
    }

    try {
      let chainUpdateBody: ChainUpdateBody = {
        uid: chainUID,
        published: isChecked,
      };
      if (!isChecked) {
        chainUpdateBody.open_to_new_members = false;
      }
      await chainUpdate(chainUpdateBody);
      setChain((s) => ({
        ...(s as Chain),
        ...chainUpdateBody,
      }));
    } catch (err: any) {
      console.error("Error updating chain: ", err);
      setError(err?.data || `Error: ${JSON.stringify(err)}`);
      setPublished(oldValue);
      setOpenToNewMembers(oldValueOpenToNewMembers);
    }
  }

  function toggleDialog() {
    setOpenQrCode((s) => !s);
  }

  async function handleChangeOpenToNewMembers(
    e: ChangeEvent<HTMLInputElement>,
  ) {
    let isChecked = e.target.checked;
    let oldValue = openToNewMembers;
    let oldValuePublished = published;
    setOpenToNewMembers(isChecked);
    if (!oldValuePublished && isChecked) {
      setPublished(true);
    }

    try {
      let chainUpdateBody: ChainUpdateBody = {
        uid: chainUID,
        open_to_new_members: isChecked,
      };
      if (!oldValuePublished && isChecked) {
        chainUpdateBody.published = true;
      }
      await chainUpdate(chainUpdateBody);
      setChain((s) => ({
        ...(s as Chain),
        ...chainUpdateBody,
      }));
    } catch (err: any) {
      console.error("Error updating chain:", err);
      setError(err?.data || `Error: ${JSON.stringify(err)}`);
      setOpenToNewMembers(oldValue);
      setPublished(oldValuePublished);
    }
  }

  async function handleChangeIsAppEnabled(e: ChangeEvent<HTMLInputElement>) {
    let isEnabled = e.target.checked;
    let oldValue = chain?.is_app_disabled || false;

    setIsAppDisabled(!isEnabled);

    try {
      await chainUpdate({ uid: chainUID, is_app_disabled: !isEnabled });
      setChain((s) => ({
        ...(s as Chain),
        is_app_disabled: !isEnabled,
      }));
    } catch (err: any) {
      console.error("Error updating chain:", err);
      setError(err?.data || `Error: ${JSON.stringify(err)}`);
      setIsAppDisabled(oldValue);
    }
  }

  function handleReasonLoopNotActive() {
    if (!chain?.published) return;

    let oldValueOpenToNewMembers = chain?.open_to_new_members || false;
    let oldValuePublished = chain?.published || false;
    setPublished(false);
    setOpenToNewMembers(false);
    const chainUpdateBody = {
      uid: chainUID,
      published: false,
      open_to_new_members: false,
    };
    chainUpdate(chainUpdateBody)
      .then(() => {
        setChain((s) => ({
          ...(s as Chain),
          ...chainUpdateBody,
        }));

        setChangingPublishedAuto(true);
        setTimeout(() => {
          setChangingPublishedAuto(false);
        }, 1500);
      })
      .catch((err: any) => {
        console.error("Error updating chain: ", err);
        setError(err?.data || `Error: ${JSON.stringify(err)}`);
        setPublished(oldValuePublished);
        setOpenToNewMembers(oldValueOpenToNewMembers);
      });
  }

  async function onImageUpload(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!chain) return;

    try {
      const res = await uploadImageFile(file, 800, EVENT_IMAGE_EXPIRATION);
      await chainUpdate({
        uid: chain.uid,
        image: res.data.image,
      });
      setChain((s) => ({ ...(s as Chain), image: res.data.image }));
    } catch (err: any) {
      addToastError(GinParseErrors(t, err));
    }
  }
  async function onImageDelete() {
    if (!chain) return;

    try {
      await chainUpdate({
        uid: chain.uid,
        image: "",
      });
      setChain((s) => ({ ...(s as Chain), image: null }));
    } catch (err: any) {
      addToastError(GinParseErrors(t, err));
    }
  }
  function goToEditTableItem(uid: UID) {
    setSelectedTable("participants");
    setTimeout(() => {
      const selector = `#member-participants-table tr[data-uid="${uid}"]`;
      let el = document.querySelector<HTMLButtonElement>(selector);
      if (el) {
        if (users && users.length > 10) el.scrollIntoView();
        el.focus();
      } else console.warn("element not found for:", selector);
    }, 100);
  }

  async function optimizeRoute(chainUID: UID) {
    try {
      const res = await routeOptimizeOrder(chainUID);
      const optimal_path = res.data.optimal_path;

      // saving current rooute before changing in the database
      setPreviousRoute(route);
      setRoute(optimal_path);
    } catch (err: any) {
      addToastError(GinParseErrors(t, err), err?.status);
      // throw err;
      return;
    }
  }

  function returnToPreviousRoute() {
    setRoute(previousRoute);
    setPreviousRoute(null);
  }

  function closeOptimizeRoutePopup(save: boolean) {
    if (save && route) {
      routeSetOrder(chainUID, route);
    } else if (previousRoute) {
      setRoute(previousRoute);
    }
    setPreviousRoute(null);
    setIsOpenRouteMapPopup(false);
  }

  function handleClickDeleteLoop() {
    addModal({
      message: t("deleteLoop"),
      content:
        chain && users
          ? () => {
              let otherUsers = users.filter((u) => u.uid !== authUser?.uid);
              return (
                <>
                  <div
                    className="mb-2"
                    dangerouslySetInnerHTML={{
                      __html: DOMPurify.sanitize(
                        t("areYouSureDeleteLoop", {
                          chain: chain.name,
                        })!,
                      ),
                    }}
                  ></div>
                  <ul
                    className={`text-sm font-semibold mx-8 ${
                      otherUsers.length > 1
                        ? "list-disc"
                        : "list-none text-center"
                    }`}
                  >
                    {otherUsers.map((u) => (
                      <li key={u.uid}>{u.name}</li>
                    ))}
                  </ul>
                </>
              );
            }
          : undefined,
      actions: [
        {
          text: t("delete"),
          type: "error",
          fn: () => {
            if (!chain) return;
            chainDelete(chain.uid)
              .then(() => {
                authUserRefresh(true).then(() => {
                  window.location.href = localizePath("/admin/dashboard");
                });
              })
              .catch((e) => {
                addToastError(GinParseErrors(t, e), e?.status);
                throw e;
              });
          },
        },
      ],
    });
  }

  useEffect(() => {
    refresh(true);
  }, [authUser]);

  const [filteredUsersHost /*filteredUsersNotHost*/] = useMemo(() => {
    let host: User[] = [];
    let notHost: User[] = [];
    users?.forEach((u) => {
      let uc = u.chains.find((uc) => uc.chain_uid === chain?.uid);
      if (uc?.is_chain_admin) host.push(u);
      else notHost.push(u);
    });

    return [host, notHost];
  }, [users, chain]);

  const isAnyTooOld = useMemo<boolean>(() => {
    if (!(unapprovedUsers && chain)) return false;

    return !!unapprovedUsers.find((u) => {
      let uc = getUserChain(u, chain.uid);
      return unapprovedTooOld(uc.created_at);
    });
  }, [chain, unapprovedUsers]);

  async function refresh(firstPageLoad = false) {
    if (!authUser) return;
    const bagGetAll = authUser
      ? bagGetAllByChain(chainUID, authUser.uid)
      : Promise.reject("authUser not set");

    try {
      const [_hostChains, chainData, chainUsers, routeData, bagData] =
        await Promise.all([
          authUser.is_root_admin
            ? chainGetAll({ filter_out_unpublished: false }).then((res) =>
                res.data.filter((c) => c.uid !== chainUID),
              )
            : Promise.all(
                authUser?.chains
                  .filter(
                    (uc) => uc.is_chain_admin && uc.chain_uid !== chainUID,
                  )
                  .map((uc) => chainGet(uc.chain_uid)) || [],
              ).then((res) => res.map((c) => c.data)),
          chainGet(chainUID, {
            addTotals: true,
            addIsAppDisabled: true,
          }),
          userGetAllByChain(chainUID),
          routeGetOrder(chainUID),
          bagGetAll,
        ]);
      setHostChains(
        _hostChains.toSorted((a, b) => a.name.localeCompare(b.name)),
      );
      setChain(chainData.data);
      setRoute(routeData.data || []);
      setUsers(
        chainUsers.data.filter(
          (u) => u.chains.find((uc) => uc.chain_uid == chainUID)?.is_approved,
        ),
      );
      setBags(bagData.data || []);
      let _unapprovedUsers = chainUsers.data.filter(
        (u) =>
          u.chains.find((uc) => uc.chain_uid == chainUID)?.is_approved == false,
      );
      setUnapprovedUsers(_unapprovedUsers);
      if (firstPageLoad && _unapprovedUsers.length)
        setSelectedTable("unapproved");
      setPublished(chainData.data.published);
      setOpenToNewMembers(chainData.data.open_to_new_members);
      setIsAppDisabled(chainData.data?.is_app_disabled || false);
      if (!firstPageLoad && _unapprovedUsers.length === 0) {
        authUserRefresh(true);
      }
    } catch (err: any) {
      if (Array.isArray(err)) err = err[0];
      if (err?.status === 401) {
        window.location.href = localizePath("/loops");
      }
    }
  }

  if (authUser === null) {
    console.info("Please redirect to /users/login", authUser);
    window.location.href = localizePath("/users/login");
  }

  if (!(authUser && chain && users && unapprovedUsers && route && bags)) {
    // console.log(chain, users, unapprovedUsers, route, bags);
    return <ChainMemberListLoading />;
  }

  const shareLink = PUBLIC_BASE_URL + "/loops/users/signup/?chain=" + chainUID;

  let userChain = authUser?.chains.find((uc) => uc.chain_uid === chain.uid);

  let isUserAdmin = userChain?.is_chain_admin || false;
  let classSubmitTransfer = "btn btn-sm";
  switch (loadingTransfer) {
    case LoadingState.error:
      classSubmitTransfer += " btn-error";
      break;
    case LoadingState.success:
      classSubmitTransfer += " btn-success";
      break;
    default:
      classSubmitTransfer += " btn-primary";
  }
  const chainImage = OriginalImageToProxy(chain.image, "288x288");

  return (
    <>
      <main>
        <div className="flex flex-col lg:flex-row max-w-screen-xl mx-auto pt-4 lg:mb-6">
          <section className="lg:w-1/3">
            <div className="relative bg-teal-light p-8">
              <div
                className={`absolute top-4 end-4 ${
                  chain.published || authUser?.is_root_admin ? "" : "hidden"
                }`}
              >
                <button
                  type="button"
                  onClick={toggleDialog}
                  className={"peer relative z-30 btn btn-circle flex group focus:ring-4 ring-purple-light".concat(
                    openQrCode ? " btn-outline" : " btn-secondary",
                  )}
                >
                  <span
                    className={"text-lg".concat(
                      openQrCode ? " icon-x" : " icon-share-2",
                    )}
                  />
                  <span
                    className={"absolute -top-8 end-0 lg:end-auto text-sm bg-secondary text-white shadow-lg rounded-sm py-1 px-2 whitespace-nowrap group-hover:opacity-100 transition-opacity".concat(
                      openQrCode ? " opacity-100" : " opacity-60",
                    )}
                  >
                    {t("shareLink")}
                  </span>
                </button>
                <dialog
                  open={openQrCode}
                  ref={refQrCodeDialog}
                  className="group peer-hover:md:block opacity-10 open:opacity-100 transition-opacity absolute z-20 top-0 ltr:sm:right-full max-sm:mt-14 rtl:sm:left-full me-0 sm:me-4"
                >
                  <div
                    className="group-open:fixed inset-0 bg-white/30 -z-10"
                    onClick={toggleDialog}
                  />
                  <div className="relative z-0 bg-white shadow-lg p-4">
                    <div className="bg-grey-light/30 p-1 flex flex-row mb-4">
                      <p className="text-xs select-all break-all leading-snug">
                        {shareLink}
                      </p>

                      <a
                        {...addCopyAttributes(
                          t,
                          "loop-detail-share",
                          "btn btn-square btn-sm btn-secondary btn-outline tooltip tooltip-left lg:!tooltip-top flex items-center",
                          shareLink,
                        )}
                        href={shareLink}
                      >
                        <span className="icon-copy"></span>
                      </a>
                    </div>
                    <QrCode data={shareLink} chainName={chain.name} />
                  </div>
                </dialog>
              </div>

              <h1 className="font-serif font-bold text-secondary mb-6 pr-10 text-4xl break-words">
                {chain.name}
              </h1>
              <ChainDescription description={chain.description} />

              <div className="flex flex-row justify-between">
                <dl>
                  <dt className="font-bold mb-1">{t("sizes")}</dt>
                  <dd className="mb-2">
                    {chain?.sizes ? (
                      <SizeBadges s={chain.sizes} g={chain.genders} />
                    ) : null}
                  </dd>
                  <dt className="font-bold mb-2">{t("participants")}</dt>
                  <dd className="text-sm mb-1">
                    {t("peopleWithCount", { count: users.length })}
                  </dd>
                </dl>

                <div
                  className={`relative self-start bg-white border-2 border-teal aspect-square w-36 ${
                    isUserAdmin || authUser.is_root_admin || chain.image
                      ? ""
                      : "hidden"
                  }`}
                >
                  <div className="absolute top-0 right-0 -mr-0.5 -mt-0.5">
                    {chain.image ? (
                      <button
                        key="delete"
                        type="button"
                        className="btn btn-sm btn-square btn-error"
                        onClick={onImageDelete}
                      >
                        <span className="icon-trash" />
                      </button>
                    ) : null}
                    <button
                      type="button"
                      key="upload"
                      className="btn btn-sm btn-square bg-white/80 btn-outline border-2 btn-secondary icon-upload"
                      onClick={() => refFileInput.current?.click()}
                    ></button>
                    <input
                      type="file"
                      className="hidden"
                      onChange={onImageUpload}
                      ref={refFileInput}
                    />
                  </div>
                  {chainImage ? (
                    <img
                      src={chainImage}
                      className={chainImage ? "" : "hidden"}
                      alt="Loop promational image"
                    />
                  ) : (
                    <div className="flex justify-center h-full items-center">
                      <div className="icon-image text-3xl text-grey"></div>
                    </div>
                  )}
                </div>
              </div>

              {isUserAdmin || authUser?.is_root_admin ? (
                <>
                  <div
                    className={`mt-4 ${
                      changingPublishedAuto ? "bg-yellow/[.6]" : ""
                    }`}
                  >
                    <div className="form-control w-full">
                      <label className="cursor-pointer label">
                        <span className="label-text">{t("published")}</span>
                        <input
                          type="checkbox"
                          className={`checkbox checkbox-secondary ${
                            error === "published" ? "border-error" : ""
                          }`}
                          name="published"
                          checked={published}
                          onChange={handleChangePublished}
                        />
                      </label>
                    </div>
                    <div className="form-control w-full">
                      <label className="cursor-pointer label">
                        <span className="label-text">
                          {t("openToNewMembers")}
                        </span>
                        <input
                          type="checkbox"
                          className={`checkbox checkbox-secondary ${
                            error === "openToNewMembers" ? "border-error" : ""
                          }`}
                          name="openToNewMembers"
                          checked={openToNewMembers}
                          onChange={handleChangeOpenToNewMembers}
                        />
                      </label>
                    </div>
                    <div className="form-control w-full">
                      <label className="cursor-pointer label">
                        <span className="label-text">
                          {isAppDisabled
                            ? t("myClothingLoopDisabled")
                            : t("myClothingLoopEnabled")}
                        </span>
                        <input
                          type="checkbox"
                          className={`checkbox checkbox-secondary ${
                            error === "isAppDisabled" ? "border-error" : ""
                          }`}
                          name="isAppEnabled"
                          checked={!isAppDisabled}
                          onChange={handleChangeIsAppEnabled}
                        />
                      </label>
                    </div>
                  </div>

                  <div className="flex flex-col md:flex-row justify-center pt-4 gap-4">
                    <a
                      className="btn btn-sm btn-secondary w-full md:w-auto"
                      href={localizePath("/loops/edit/?chain=" + chainUID)}
                    >
                      {t("editLoop")}
                      <span className="ms-2 icon-pencil-2" aria-hidden />
                    </a>

                    <button
                      type="button"
                      className="btn btn-sm btn-error w-full md:w-auto"
                      onClick={handleClickDeleteLoop}
                    >
                      {t("deleteLoop")}
                      <span className="ms-2 icon-trash" aria-hidden />
                    </button>
                  </div>
                </>
              ) : null}
            </div>
          </section>

          <section className="lg:w-2/3 relative py-8 sm:p-8 lg:pt-0 bg-secondary-light">
            <div className="px-2 lg:px-0">
              <h2 className="font-semibold text-secondary mb-6 text-3xl">
                {t("loopHost", { count: filteredUsersHost.length })}
              </h2>
              <HostTable
                authUser={authUser}
                filteredUsersHost={filteredUsersHost}
                chain={chain}
                refresh={refresh}
              />
              {isOpenRouteMapPopup ? (
                <Suspense fallback={null}>
                  <RouteMapPopup
                    chain={chain}
                    route={route}
                    shouldSave={!!previousRoute}
                    closeFunc={closeOptimizeRoutePopup}
                    optimizeRoute={() => optimizeRoute(chain.uid)}
                    returnToPreviousRoute={returnToPreviousRoute}
                  />
                </Suspense>
              ) : null}
            </div>
          </section>
        </div>

        <div className="max-w-screen-xl mx-auto px-2 sm:px-8">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 justify-items-center md:justify-items-start">
            <h2 className="order-1 md:col-span-full lg:col-span-1 font-semibold text-secondary self-center text-3xl">
              {t("loopParticipant", {
                count: unapprovedUsers.length + users.length,
              })}
            </h2>

            <div className="order-3 sm:order-2 lg:col-span-1 lg:justify-self-center flex border border-secondary bg-teal-light">
              <label>
                <input
                  type="radio"
                  name="table-type"
                  value="route"
                  checked={selectedTable === "route"}
                  onChange={() => setSelectedTable("route")}
                  className="hidden peer"
                />
                <div className="relative btn no-animation bg-transparent hover:bg-black hover:text-secondary-content transition-none text-black pe-3 me-3 border-0 peer-checked:btn-secondary peer-checked:hover:bg-secondary">
                  {t("route")}
                  <span className="skew-x-6 rtl:-skew-x-6 w-4 h-12 bg-[inherit] absolute -right-2 rtl:right-auto rtl:-left-2"></span>
                </div>
              </label>
              <label>
                <input
                  type="radio"
                  name="table-type"
                  value="participants"
                  checked={selectedTable === "participants"}
                  onChange={() => setSelectedTable("participants")}
                  className="hidden peer"
                />
                <div className="relative btn no-animation bg-transparent hover:bg-black hover:text-secondary-content transition-none text-black px-2 border-0 peer-checked:btn-secondary peer-checked:hover:bg-secondary">
                  <span className="-skew-x-6 w-4 h-12 bg-[inherit] absolute -left-3"></span>
                  {t("edit")}
                  <span className="skew-x-6 w-4 h-12 bg-[inherit] absolute -right-3"></span>
                </div>
              </label>
              <label>
                <input
                  type="radio"
                  name="table-type"
                  value="unapproved"
                  checked={selectedTable === "unapproved"}
                  onChange={() => {
                    if (unapprovedUsers.length) setSelectedTable("unapproved");
                  }}
                  disabled={!unapprovedUsers.length}
                  className="hidden peer"
                />
                <div
                  className={`relative btn no-animation bg-transparent hover:bg-black hover:text-secondary-content transition-none ps-3 ms-3 border-0 peer-checked:btn-secondary peer-checked:hover:bg-secondary ${
                    unapprovedUsers.length
                      ? "text-black"
                      : "text-base-300 cursor-not-allowed"
                  }`}
                >
                  <span className="-skew-x-6 rtl:skew-x-6 w-4 h-12 bg-[inherit] absolute -left-2 rtl:left-0 rtl:-right-2"></span>
                  {t("new")}
                  <span
                    className={`absolute -top-3 -right-3 rtl:right-auto rtl:-left-3 block py-1 px-2 rounded-lg ${
                      unapprovedUsers.length
                        ? isAnyTooOld
                          ? "bg-error text-black"
                          : "bg-primary text-black"
                        : "bg-base-200 text-base-300"
                    }`}
                  >
                    {unapprovedUsers.length}
                  </span>
                </div>
              </label>
            </div>
            <div className="order-2 md:justify-self-end lg:order-3 sm:-ms-8 flex flex-col xs:flex-row items-center">
              {selectedTable === "route" ? (
                <button
                  type="button"
                  className={`btn inline-flex me-4 ${
                    isOpenRouteMapPopup
                      ? "btn-outline"
                      : "btn-accent text-white"
                  }`}
                  onClick={() => setIsOpenRouteMapPopup(!isOpenRouteMapPopup)}
                >
                  {t("map")}
                  <span
                    className={`${
                      isOpenRouteMapPopup ? "icon-x" : "icon-map"
                    } ms-3`}
                  />
                </button>
              ) : null}

              {selectedTable !== "unapproved" ? (
                <UserDataExport
                  chainName={chain.name}
                  chainUsers={
                    selectedTable === "participants"
                      ? participantsSortUsers
                      : routeSortUsers
                  }
                  route={route}
                  key="export"
                />
              ) : null}
            </div>
          </div>

          {selectedTable === "unapproved" ? (
            <ApproveTable
              key="unapproved"
              authUser={authUser}
              unapprovedUsers={unapprovedUsers}
              chain={chain}
              refresh={refresh}
              onReasonLoopNotActive={handleReasonLoopNotActive}
            />
          ) : selectedTable === "participants" ? (
            <ParticipantsTable
              key="participants"
              authUser={authUser}
              users={participantsSortUsers}
              sortBy={participantsSortBy}
              setSortBy={setParticipantsSortBy}
              chain={chain}
              hostChains={hostChains}
              refresh={refresh}
            />
          ) : (
            <RouteTable
              key="route"
              authUser={authUser}
              users={routeSortUsers}
              chain={chain}
              route={route}
              bags={bags}
              setRoute={setRoute}
              refresh={refresh}
              onGoToEditTableItem={goToEditTableItem}
            />
          )}
        </div>
      </main>
    </>
  );
}

function HostTable(props: {
  authUser: User | undefined | null;
  chain: Chain;
  filteredUsersHost: User[];
  refresh: () => Promise<void>;
}) {
  const { t, i18n } = useTranslation();
  const localizePath = useLocalizePath(i18n);

  function getEditLocation(u: User): string {
    if (!u.uid) return "#";

    return localizePath(`/users/edit/?user=${u.uid}&chain=${props.chain.uid}`);
  }

  function onDemote(e: MouseEvent, u: User) {
    e.preventDefault();
    const chainUID = props.chain.uid;

    addModal({
      message: t("areYouSureRevokeHost", { name: u.name }),
      actions: [
        {
          text: t("revoke"),
          type: "error",
          fn: () => {
            chainAddUser(chainUID, u.uid, false)
              .catch((err) => {
                addToastError(GinParseErrors(t, err), err.status);
              })
              .finally(() => props.refresh());
          },
        },
      ],
    });
  }

  const dropdownItems = (u: User) => [
    <a href={getEditLocation(u)}>{t("edit")}</a>,
    ...(props.filteredUsersHost.length > 1
      ? [
          <button
            type="button"
            onClick={(e) => onDemote(e, u)}
            className="text-red"
          >
            {t("setAsAParticipant")}
          </button>,
        ]
      : []),
  ];
  return (
    <div className="overflow-x-auto">
      <table className="table table-compact w-full mb-10">
        <thead>
          <tr>
            <th className="md:hidden w-[0.1%]"></th>
            <th>{t("name")}</th>
            <th>{t("email")}</th>
            <th>{t("phone")}</th>
            <th className="hidden md:table-cell w-[0.1%]"></th>
          </tr>
        </thead>
        <tbody>
          {props.filteredUsersHost
            ?.sort((a, b) => a.name.localeCompare(b.name))
            .map((u) => (
              <tr key={u.uid} className="[&>td]:hover:bg-base-200/[0.6]">
                <td className="md:hidden !px-0">
                  <DropdownMenu
                    classes="ltr:dropdown-right rtl:dropdown-left"
                    items={dropdownItems(u)}
                  />
                </td>
                <td>{u.name}</td>
                <td>{u.email}</td>
                <td>{u.phone_number}</td>
                <td className="text-right hidden md:table-cell">
                  <DropdownMenu
                    classes="ltr:dropdown-left rtl:!dropdown-right"
                    items={dropdownItems(u)}
                  />
                </td>
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  );
}

function ApproveTable(props: {
  authUser: User | undefined | null;
  unapprovedUsers: User[];
  chain: Chain;
  refresh: () => Promise<void>;
  onReasonLoopNotActive: () => void;
}) {
  const { t, i18n } = useTranslation();

  function onApprove(e: MouseEvent, user: User) {
    e.preventDefault();

    const chainUID = props.chain.uid;

    addModal({
      message: t("approveParticipant", { name: user.name }),
      actions: [
        {
          text: t("approve"),
          type: "success",
          fn: () => {
            chainUserApprove(chainUID, user.uid)
              .then(() => {
                if (window.goatcounter)
                  window.goatcounter.count({
                    path: "approve-user",
                    title: "Approve user",
                    event: true,
                  });
              })
              .catch((err) => {
                addToastError(GinParseErrors(t, err), err.status);
              })
              .finally(() => props.refresh());
          },
        },
      ],
    });
  }

  function onDeny(e: MouseEvent, userUID: UID) {
    e.preventDefault();

    const chainUID = props.chain.uid;

    const chainDeleteUnapprovedReason = (reason: UnapprovedReason) =>
      chainDeleteUnapproved(chainUID, userUID, reason)
        .then((res) => {
          window.goatcounter?.count({
            path: "deny-user",
            title: "Deny user",
            event: true,
          });
          return res;
        })
        .catch((err) => {
          addToastError(GinParseErrors(t, err), err.status);
        })
        .finally(() => props.refresh());

    addModal({
      message: t("reasonForDenyingJoin"),
      actions: [
        {
          text: t("tooFarAway"),
          type: "secondary",
          fn: () => {
            chainDeleteUnapprovedReason(UnapprovedReason.TOO_FAR_AWAY);
          },
        },
        {
          text: t("differentSizes"),
          type: "secondary",
          fn: () => {
            chainDeleteUnapprovedReason(UnapprovedReason.SIZES_GENDERS);
          },
        },
        {
          text: t("loopNotActive"),
          type: "secondary",
          fn: () => {
            chainDeleteUnapprovedReason(UnapprovedReason.LOOP_NOT_ACTIVE);
            props.onReasonLoopNotActive();
          },
        },
        {
          text: t("other"),
          type: "secondary",
          fn: () => {
            chainDeleteUnapprovedReason(UnapprovedReason.OTHER);
          },
        },
      ],
    });
  }

  return (
    <>
      <div className="mt-6 relative overflow-hidden">
        <div className="overflow-x-auto">
          <table className="table table-compact w-full mb-10">
            <thead>
              <tr>
                <th className="lg:hidden w-[0.1%]"></th>
                <th>
                  <span>{t("name")}</span>
                </th>
                <th>
                  <span>{t("address")}</span>
                </th>
                <th>
                  <span>{t("contact")}</span>
                </th>
                <th>
                  <span>{t("interestedSizes")}</span>
                </th>
                <th></th>
                <th className="hidden lg:table-cell"></th>
              </tr>
            </thead>
            <tbody>
              {props.unapprovedUsers
                .sort((a, b) => {
                  const ucA = getUserChain(a, props.chain.uid);
                  const ucB = getUserChain(b, props.chain.uid);

                  return new Date(ucA.created_at) > new Date(ucB.created_at)
                    ? -1
                    : 1;
                })
                .map((u) => {
                  const uc = getUserChain(u, props.chain.uid);
                  const tooOld = unapprovedTooOld(uc.created_at);
                  return (
                    <tr
                      key={u.uid}
                      className={
                        tooOld
                          ? "[&>td]:bg-red/[.5] [&>td]:hover:bg-red/[.3]"
                          : "[&>td]:bg-yellow/[.6] [&>td]:hover:bg-yellow/[.4]"
                      }
                    >
                      <td className="lg:hidden !px-0">
                        <DropdownMenu
                          classes="ltr:dropdown-right rtl:dropdown-left"
                          items={[
                            <button
                              type="button"
                              onClick={(e) => onApprove(e, u)}
                            >
                              {t("approve")}
                            </button>,
                            <button
                              type="button"
                              onClick={(e) => onDeny(e, u.uid)}
                              className="text-red"
                            >
                              {t("deny")}
                            </button>,
                          ]}
                        />
                      </td>
                      <td>{u.name}</td>
                      <td>
                        <span className="block w-48 text-sm whitespace-normal">
                          {u.address}
                        </span>
                      </td>
                      <td className="text-sm leading-relaxed">
                        <a href={"mailto:" + u.email}>{u.email}</a>
                        <br />
                        <a href={"tel:" + u.phone_number}>{u.phone_number}</a>
                      </td>
                      <td className="align-middle">
                        <span
                          className={`block min-w-[12rem] rounded-lg whitespace-normal [&_span]:mb-2 -mb-2 `}
                          tabIndex={0}
                        >
                          <SizeBadges s={u.sizes} />
                        </span>
                      </td>
                      <td className="text-center">
                        {simplifyDays(t, i18n, uc.created_at)}
                      </td>
                      <td className="text-right hidden lg:table-cell">
                        <button
                          className="btn btn-ghost hover:bg-white hover:text-green"
                          type="button"
                          onClick={(e) => onApprove(e, u)}
                        >
                          {t("approve")}
                        </button>
                        <button
                          className="btn btn-ghost hover:bg-white hover:text-red"
                          type="button"
                          onClick={(e) => onDeny(e, u.uid)}
                        >
                          {t("deny")}
                        </button>
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

type ParticipantsSortBy = "name" | "email" | "date";
function ParticipantsTable(props: {
  authUser: User | undefined | null;
  users: User[];
  sortBy: ParticipantsSortBy;
  setSortBy: (sortBy: ParticipantsSortBy) => void;
  chain: Chain;
  refresh: () => Promise<void>;
  hostChains: Chain[];
}) {
  const { t, i18n } = useTranslation();
  const localizePath = useLocalizePath(i18n);
  const addCopyAttributes = useToClipboard();

  function getEditLocation(user: User): string {
    if (!user.uid) {
      addToastError("Edit button coundn't find user of: " + user.name, 500);
      return "#";
    }

    return localizePath(
      `/users/edit/?user=${user.uid}&chain=${props.chain.uid}`,
    );
  }

  function onRemove(user: User) {
    const chainUID = props.chain.uid;

    addModal({
      message: t("areYouSureRemoveParticipant", {
        name: user.name,
        interpolation: { escapeValue: false },
      }),
      actions: [
        {
          text: t("remove"),
          type: "error",
          fn: () => {
            chainRemoveUser(chainUID, user.uid)
              .catch((err) => {
                addToastError(GinParseErrors(t, err), err.status);
              })
              .finally(() => {
                props.refresh();
              });
          },
        },
      ],
    });
  }
  function onAddCoHost(user: User) {
    addModal({
      message: t("addCoHost"),
      content: () => (
        <p className="text-center">
          <span className="icon-user inline-block mr-1" />
          {user.name}
        </p>
      ),
      actions: [
        {
          text: t("addCoHost"),
          type: "success",
          submit: true,
          fn: () => {
            chainAddUser(props.chain.uid, user.uid, true)
              .catch((err) => {
                addToastError(GinParseErrors(t, err), err.status);
              })
              .finally(() => {
                props.refresh();
              });
          },
        },
      ],
    });
  }
  function onTransfer(user: User, isCopy: boolean) {
    addModal({
      message: t("copyParticipantToLoop"),
      content: () => (
        <div>
          <div className="flex flex-col items-center">
            <PopoverOnHover
              message={
                isCopy ? t("copyParticipantInfo") : t("transferParticipantInfo")
              }
              className="absolute top-5 ltr:right-4 rtl:left-4 tooltip-left"
            />
            <p className="mb-4">
              <span className="icon-user inline-block mr-1" />
              {user.name}
            </p>
            <p className="mb-1 font-semibold text-sm">{props.chain.name}</p>
            <span className="icon-arrow-down inline-block mb-1" />
          </div>
          <select
            className="w-full select select-sm rounded-none disabled:text-base-300 border-2 border-black"
            name="loop"
            defaultValue=""
            required
          >
            <option disabled value="">
              {t("selectLoop")}
            </option>
            {props.hostChains.map((u) => (
              <option key={u.uid} value={u.uid}>
                {u.name}
              </option>
            ))}
          </select>
        </div>
      ),
      actions: [
        {
          text: isCopy ? t("copy") : t("transfer"),
          type: "success",
          submit: true,
          fn(formValues) {
            let toChainUID = formValues?.loop || "";
            if (!toChainUID) return Error("Invalid loop");

            userTransferChain(props.chain.uid, toChainUID, user.uid, isCopy)
              .catch((err) => {
                addToastError(GinParseErrors(t, err), err.status);
              })
              .finally(() => {
                props.refresh();
              });
          },
        },
      ],
    });
  }
  function getUserChain(u: User): UserChain {
    return u.chains.find((uc) => uc.chain_uid === props.chain.uid)!;
  }

  function toggleSortBy(_sortBy: ParticipantsSortBy) {
    props.setSortBy(props.sortBy !== _sortBy ? _sortBy : "date");
  }

  async function loginAsUser(u: User) {
    const linkInit = (await loginSuperAsGenerateLink(u.uid, false)).data;
    addModal({
      message: `Login as "${u.name}"`,
      content() {
        const [activeTab, _setActiveTab] = useState<"website" | "app">(
          "website",
        );
        const [activeLink, _setActiveLink] = useState(linkInit);
        const setActiveTab = async (tab: "website" | "app") => {
          const link = (await loginSuperAsGenerateLink(u.uid, tab === "app"))
            .data;
          _setActiveLink(link);
          _setActiveTab(tab);
        };
        return (
          <div>
            <p className="mb-2">
              Click the text field to copy the url, then open a private window
              and go to the page link
            </p>
            <div className="flex flex-col items-center">
              <div className="tabs tabs-boxed mb-2">
                <button
                  type="button"
                  onClick={() => setActiveTab("website")}
                  className={"tab".concat(
                    activeTab === "website" ? " tab-active" : "",
                  )}
                >
                  Website
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("app")}
                  className={"tab".concat(
                    activeTab === "app" ? " tab-active" : "",
                  )}
                >
                  App
                </button>
              </div>
              <label className="input-group justify-center">
                <input
                  type="text"
                  value={activeLink}
                  onClick={(e) => (e.target as HTMLInputElement).select()}
                  onChangeCapture={(e) => e.preventDefault()}
                  className="input input-bordered"
                />
                <button
                  type="button"
                  {...addCopyAttributes(
                    t,
                    "input-login-as-" + u.uid,
                    undefined,
                    activeLink,
                  )}
                  className="btn btn-outline"
                >
                  {t("copy")}
                </button>
              </label>
            </div>
          </div>
        );
      },
      actions: [],
    });
  }

  return (
    <>
      <div className="mt-6 relative overflow-hidden">
        <div className="overflow-x-auto">
          <table
            className="table table-compact w-full mb-10"
            id="member-participants-table"
          >
            <thead>
              <tr>
                <th className="w-[0.1%]"></th>
                <th>
                  <span>{t("name")}</span>
                  <SortButton
                    isSelected={props.sortBy === "name"}
                    className="ms-1"
                    onClick={() => toggleSortBy("name")}
                  />
                </th>
                <th>
                  <span>{t("address")}</span>
                </th>
                <th>
                  <span>{t("email")}</span>
                  <SortButton
                    isSelected={props.sortBy === "email"}
                    className="ms-1"
                    onClick={() => toggleSortBy("email")}
                  />
                </th>
                <th>{t("phone")}</th>
                <th>{t("interestedSizes")}</th>
                <th>
                  <span>{t("signedUpOn")}</span>
                  <SortButton
                    isSelected={props.sortBy === "date"}
                    className="ms-1"
                    onClick={() => toggleSortBy("date")}
                  />
                </th>
              </tr>
            </thead>
            <tbody>
              {props.users.map((u, i) => {
                const userChain = getUserChain(u);

                let dropdownItems = [
                  <button
                    type="button"
                    onClick={() => onRemove(u)}
                    className="text-red"
                  >
                    {t("removeFromLoop")}
                  </button>,
                  <a href={getEditLocation(u)}>{t("edit")}</a>,
                  ...(!userChain.is_chain_admin
                    ? [
                        <button type="button" onClick={() => onAddCoHost(u)}>
                          {t("addCoHost")}
                        </button>,
                      ]
                    : []),
                  ...((props.hostChains.length &&
                    !userChain.is_chain_admin &&
                    props.authUser?.uid !== u.uid) ||
                  props.authUser?.is_root_admin
                    ? [
                        <button
                          type="button"
                          onClick={() => onTransfer(u, false)}
                          className="text-red"
                        >
                          {t("transfer")}
                        </button>,
                        <button
                          type="button"
                          onClick={() => onTransfer(u, true)}
                          className="text-red"
                        >
                          {t("copy")}
                        </button>,
                      ]
                    : []),
                  ...(props.authUser?.is_root_admin
                    ? [
                        <button
                          type="button"
                          className="text-purple"
                          onClick={() => loginAsUser(u)}
                        >
                          Login as {u.name}
                        </button>,
                      ]
                    : []),
                ];

                let dropdownClasses = "ltr:dropdown-right rtl:dropdown-left";
                if (i > 1) {
                  dropdownClasses += " dropdown-end";
                }
                return (
                  <tr
                    key={u.uid}
                    data-uid={u.uid}
                    tabIndex={-1}
                    className="[&>td]:hover:bg-base-200/[0.6] [&>td]:focus:bg-primary/[0.3] group"
                  >
                    <td className="!px-0">
                      <DropdownMenu
                        classes={dropdownClasses}
                        items={dropdownItems}
                      />
                    </td>
                    <td>{u.name}</td>
                    <td>
                      <span className="block w-48 text-sm whitespace-normal">
                        {u.address}
                      </span>
                    </td>
                    <td className="text-sm leading-relaxed">
                      {u.email ? (
                        <a className="link" href={"mailto:" + u.email}>
                          {u.email}
                        </a>
                      ) : null}
                    </td>
                    <td className="text-sm leading-relaxed">
                      {u.phone_number ? (
                        <a className="link" href={"tel:" + u.phone_number}>
                          {u.phone_number}
                        </a>
                      ) : null}
                    </td>
                    <td>
                      <SizeBadges s={u.sizes} />
                    </td>
                    <td className="text-center">
                      {simplifyDays(t, i18n, userChain.created_at)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

function RouteTable(props: {
  authUser: User | undefined | null;
  users: User[];
  chain: Chain;
  route: UID[];
  bags: Bag[];
  setRoute: (route: UID[]) => void;
  refresh: () => Promise<void>;
  onGoToEditTableItem: (uid: UID) => void;
}) {
  const { t } = useTranslation();
  const [isDraggable, setIsDraggable] = useState(true);
  const [dragging, setDragging] = useState<string>("");
  const [dragTarget, setDragTarget] = useState<string>("");

  function mapUsersToOrder(users: { uid: string }[]): {
    [uid: string]: number;
  } {
    return users.reduce<Record<string, number>>((acc, user, index) => {
      acc[user.uid] = index + 1;
      return acc;
    }, {});
  }

  const [routeOrder, setRouteOrder] = useState<{ [uid: string]: number }>(() =>
    mapUsersToOrder(props.users),
  );

  useEffect(() => {
    const newRouteOrder = mapUsersToOrder(props.users);
    setRouteOrder(newRouteOrder);
  }, [props.users]);

  function setRoute(r: typeof props.route) {
    routeSetOrder(props.chain.uid, r);
    props.setRoute(r);
  }
  function draggingEnd(/*e: DragEvent<HTMLTableRowElement>*/) {
    const fromIndex = props.route.indexOf(dragging);
    const toIndex = props.route.indexOf(dragTarget);

    setDragTarget("");
    setRoute(reOrder(props.route, fromIndex, toIndex));
  }
  function handleInputChangeRoute(uid: string) {
    const toIndex = routeOrder[uid] - 1;
    const fromIndex = props.route.indexOf(uid);
    setRoute(reOrder(props.route, fromIndex, toIndex));
  }

  useEffect(() => {
    if (isTouchDevice()) {
      setIsDraggable(false);
    }
  }, []);

  return (
    <>
      <div className="mt-6 relative overflow-hidden">
        <div className="overflow-x-auto">
          <table className="table table-compact w-full mb-20">
            <thead>
              <tr>
                <th className="w-[0.1%]" colSpan={2}>
                  <span>{t("route")}</span>
                </th>
                <th>
                  <span>{t("name")}</span>
                </th>
                <th>
                  <span>{t("address")}</span>
                </th>
                <th>
                  <span>{t("contact")}</span>
                </th>
                <th className="w-[0.1%]"></th>
              </tr>
            </thead>
            <tbody>
              {props.users.map((u: User, i) => {
                let classTdDragging = dragging === u.uid ? "bg-grey/[.1]" : "";
                if (dragTarget === u.uid) {
                  const orderTarget = props.route.indexOf(dragTarget);
                  const orderDrag = props.route.indexOf(dragging);

                  if (orderTarget == orderDrag) {
                  } else if (orderTarget < orderDrag) {
                    classTdDragging += " border-t-4 border-t-grey";
                  } else {
                    classTdDragging += " border-b-4 border-b-grey";
                  }
                }

                let userBags = props.bags
                  .filter((b) => b.user_uid === u.uid)
                  .sort((a, b) => {
                    let aDate = new Date(a.updated_at);
                    let bDate = new Date(b.updated_at);

                    return aDate > bDate ? -1 : 1;
                  });

                return (
                  <tr
                    key={u.uid}
                    onDragStart={() => setDragging(u.uid)}
                    onDrag={() => setDragging(u.uid)}
                    onDragEnd={draggingEnd}
                    onDragOver={() => setDragTarget(u.uid)}
                    draggable={isDraggable}
                    className="[&>td]:hover:bg-base-200/[0.6] group"
                  >
                    <td className={`${classTdDragging} text-center`}>
                      <span className="hidden lg:inline-block py-1 px-2 bg-base-200 rounded-lg font-semibold">
                        {routeOrder[u.uid]}
                      </span>
                      <input
                        onClick={(e) => (e.target as any).select()}
                        onChange={(e) =>
                          setRouteOrder({
                            ...routeOrder,
                            [u.uid]: e.target.valueAsNumber,
                          })
                        }
                        onBlur={() => handleInputChangeRoute(u.uid)}
                        onKeyUp={(e) => {
                          if (e.key === "Enter") {
                            handleInputChangeRoute(u.uid);
                          }
                        }}
                        max={props.route.length + 1}
                        min={1}
                        type="number"
                        className="inline-block lg:hidden input-reset w-14 py-1 px-2 bg-base-200 rounded-lg font-semibold text-center"
                        value={routeOrder[u.uid]}
                      />

                      <div
                        tabIndex={0}
                        aria-label="drag"
                        className="hidden lg:inline-block p-1 ml-2 rounded-full hover:bg-white cursor-grab active:cursor-grabbing icon-maximize-2 -rotate-45"
                      ></div>
                    </td>
                    <td
                      className={`${classTdDragging} !p-0 relative min-h-[1px]`}
                    >
                      <BagsColumn bags={userBags} />
                    </td>
                    <td className={classTdDragging}>{u.name}</td>
                    <td className={classTdDragging}>
                      <span className="block w-48 text-sm whitespace-normal">
                        {u.address}
                      </span>
                    </td>
                    <td
                      className={`${classTdDragging} text-sm leading-relaxed`}
                    >
                      {u.email}
                      <br />
                      {u.phone_number}
                    </td>
                    <td className={`${classTdDragging} text-right`}>
                      <button
                        aria-label="go to edit"
                        className="btn btn-circle btn-sm btn-ghost bg-base-100 icon-info"
                        onClick={() => props.onGoToEditTableItem(u.uid)}
                      ></button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

function SortButton(props: {
  className?: string;
  onClick: MouseEventHandler;
  isSelected: boolean;
}) {
  const { t } = useTranslation();

  const classIcon = props.isSelected
    ? "btn-outline text-secondary"
    : "btn-ghost";

  return (
    <button
      aria-label={t("sort")!}
      className={
        "btn btn-xs btn-circle icon-chevrons-down " +
        props.className +
        " " +
        classIcon
      }
      onClick={props.onClick}
    ></button>
  );
}

function DropdownMenu(props: { items: ReactElement[]; classes: string }) {
  return (
    <div className={"dropdown ".concat(props.classes)}>
      <label tabIndex={0} className="btn btn-ghost">
        <span className="text-xl icon-ellipsis-vertical" />
      </label>
      <ul
        tabIndex={0}
        className={"dropdown-content menu shadow bg-base-100 font-bold text-teal ".concat(
          props.items.length === 1 ? "h-full" : "",
        )}
      >
        {props.items.map((item, i) => (
          <li
            key={i}
            className={props.items.length === 1 ? "h-full [&>*]:h-full" : ""}
          >
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

function getUserChain(u: User, chainUID: UID): UserChain {
  return u.chains.find((uc) => uc.chain_uid === chainUID)!;
}

function reOrder(arr: string[], fromIndex: number, toIndex: number): string[] {
  let item = arr[fromIndex];
  arr = arr.filter((_, i) => i !== fromIndex);
  let res: string[] = [];

  res.push(...arr.slice(0, toIndex));
  res.push(item);
  res.push(...arr.slice(toIndex));

  return res;
}

function unapprovedTooOld(date: string): boolean {
  const numDays = dayjs().diff(dayjs(date), "days");

  return numDays > 30;
}

function BagsColumn(props: { bags: Bag[] }) {
  const { t } = useTranslation();
  let bagsJSX: JSX.Element[] = [];
  if (props.bags.length > 1) {
    let bagLocation: string[] = [];
    switch (props.bags.length) {
      case 2:
      case 3:
      case 4:
        bagLocation = [
          "brightness-90 translate-x-1 translate-y-1",
          "brightness-110 -translate-x-1 translate-y-1",
          "brightness-75 -translate-y-1",
        ];
        break;
      case 5:
        bagLocation = [
          "brightness-90 translate-x-1 translate-y-1",
          "brightness-110 -translate-x-1 translate-y-1",
          "brightness-75 -translate-x-1 -translate-y-1",
          "translate-x-1 -translate-y-1",
        ];
    }
    bagsJSX = props.bags.slice(1).map((bag, i) => (
      <div
        key={i + 1}
        className={`absolute w-8 h-8 rounded-full transition-transform group-hover/bag:translate-x-0 group-hover/bag:translate-y-0 ${bagLocation[i]}`}
        style={{
          backgroundColor: bag.color,
        }}
      ></div>
    ));
  }
  if (props.bags.length > 0) {
    let firstBag = props.bags[0];
    bagsJSX.push(
      <div
        key={0}
        className="relative w-8 h-8 flex items-center justify-center icon-shopping-bag scale-[0.9] text-xl text-white rounded-full cursor-pointer transition-transform group-active/bag:scale-[0.7]"
        style={{
          backgroundColor: firstBag.color,
        }}
      ></div>,
    );
  }

  return (
    <div className="dropdown ltr:dropdown-right rtl:dropdown-left">
      <div aria-label={t("bag")!} className="h-full group/bag" tabIndex={0}>
        {bagsJSX}
      </div>
      <table className="dropdown-content bg-white p-3 border-grey-light border shadow-lg space-y-3 table-fixed">
        <thead>
          <tr>
            <th colSpan={3} className="text-center">
              {t("bags")}
            </th>
          </tr>
        </thead>
        <tbody>
          {props.bags.map((bag) => {
            let d = dayjs(bag.updated_at);
            return (
              <tr key={bag.id} className="">
                <td>
                  <span
                    className="block rounded-full h-4 w-4"
                    style={{
                      backgroundColor: bag.color,
                    }}
                  ></span>
                </td>
                <td className="font-bold">{bag.number}</td>
                <td className="ltr:text-right">{d.format("LL")}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
