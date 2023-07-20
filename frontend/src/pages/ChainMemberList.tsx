import {
  useState,
  useEffect,
  useContext,
  ChangeEvent,
  useMemo,
  FormEvent,
  useRef,
  MouseEvent,
  MouseEventHandler,
  ReactElement,
  DragEvent,
  LegacyRef,
  SelectHTMLAttributes,
} from "react";

import { useParams, Link, useHistory } from "react-router-dom";
import type { LocationDescriptor } from "history";
import { Helmet } from "react-helmet";
import { useTranslation } from "react-i18next";
import dayjs from "../util/dayjs";
import simplifyDays from "../util/simplify-days";

import { AuthContext } from "../providers/AuthProvider";
import { UserDataExport } from "../components/DataExport";
import {
  chainAddUser,
  chainDeleteUnapproved,
  chainGet,
  chainGetAll,
  chainRemoveUser,
  chainUpdate,
  ChainUpdateBody,
  chainUserApprove,
  UnapprovedReason,
} from "../api/chain";
import { Bag, Chain, UID, User, UserChain } from "../api/types";
import { userGetAllByChain, userTransferChain } from "../api/user";
import { ToastContext } from "../providers/ToastProvider";
import { SizeBadges } from "../components/Badges";
import FormJup from "../util/form-jup";
import { GinParseErrors } from "../util/gin-errors";
import { routeGetOrder, routeOptimizeOrder, routeSetOrder } from "../api/route";
import useToClipboard from "../util/to-clipboard.hooks";
import { bagGetAllByChain } from "../api/bag";
import { Sleep } from "../util/sleep";
import PopoverOnHover from "../components/Popover";

enum LoadingState {
  idle,
  loading,
  error,
  success,
}

interface Params {
  chainUID: string;
}
type SelectedTable = "route" | "participants" | "unapproved";

const VITE_BASE_URL = import.meta.env.VITE_BASE_URL;

export default function ChainMemberList() {
  const history = useHistory();
  const { t } = useTranslation();
  const { chainUID } = useParams<Params>();
  const { authUser } = useContext(AuthContext);
  const { addToastError, addModal } = useContext(ToastContext);

  const [hostChains, setHostChains] = useState<Chain[]>([]);
  const [loadingTransfer, setLoadingTransfer] = useState(LoadingState.idle);
  const [chain, setChain] = useState<Chain | null>(null);
  const [users, setUsers] = useState<User[] | null>(null);
  const [bags, setBags] = useState<Bag[] | null>(null);
  const [route, setRoute] = useState<UID[] | null>(null);
  const [routeWasOptimized, setRouteWasOptimized] = useState<boolean>(false);
  const [previousRoute, setPreviousRoute] = useState<UID[] | null>(null);

  const [participantsSortBy, setParticipantsSortBy] =
    useState<ParticipantsSortBy>("date");
  const [unapprovedUsers, setUnapprovedUsers] = useState<User[] | null>(null);
  const [published, setPublished] = useState(true);
  const [openToNewMembers, setOpenToNewMembers] = useState(true);
  const [error, setError] = useState("");
  const [selectedTable, setSelectedTable] = useState<SelectedTable>("route");
  const refSelectAddCoHost: any = useRef<HTMLSelectElement>();
  const refSelectTransferParticipant: any = useRef<HTMLSelectElement>();
  const refSelectTransferChain: any = useRef<HTMLSelectElement>();
  const addCopyAttributes = useToClipboard();

  const participantsSortUsers = useMemo(() => {
    if (!users) return [];
    const sortBy = participantsSortBy;
    let res = [...users];
    switch (sortBy) {
      case "email":
      case "name":
        res = res.sort((a, b) =>
          a[sortBy].localeCompare(b[sortBy]) == 1 ? 1 : -1
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
      route.indexOf(a.uid) < route.indexOf(b.uid) ? -1 : 1
    );
  }, [users, route]);

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
    } catch (err: any) {
      console.error("Error updating chain: ", err);
      setError(err?.data || `Error: ${JSON.stringify(err)}`);
      setPublished(oldValue);
      setOpenToNewMembers(oldValueOpenToNewMembers);
    }
  }

  async function handleChangeOpenToNewMembers(
    e: ChangeEvent<HTMLInputElement>
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
    } catch (err: any) {
      console.error("Error updating chain:", err);
      setError(err?.data || `Error: ${JSON.stringify(err)}`);
      setOpenToNewMembers(oldValue);
      setPublished(oldValuePublished);
    }
  }

  function onAddCoHost(e: FormEvent) {
    e.preventDefault();
    if (!chain) return;
    const values = FormJup<{ participant: string }>(e);

    let chainUID = chain.uid;
    chainAddUser(chainUID, values.participant, true)
      .catch((err) => {
        addToastError(GinParseErrors(t, err), err.status);
      })
      .finally(() => {
        (refSelectAddCoHost.current as HTMLSelectElement).value = "";
        return refresh();
      });
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

  function handleAddCoHost(user: User) {
    addModal({
      message: "",
      content: () => (
        <div>
          <p>{chain?.name + " / " + user.name}</p>
        </div>
      ),
      actions: [],
    });
  }
  function handleTransfer(user: User) {
    addModal({
      message: "",
      content: () => (
        <div>
          <p>{chain?.name + " / " + user.name}</p>
        </div>
      ),
      actions: [],
    });
  }
  function submitTransfer(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (loadingTransfer !== LoadingState.idle) return;

    const transferUserUID = refSelectTransferParticipant.current.value;
    const transferFromChainUID = chainUID;
    const transferToChainUID = refSelectTransferChain.current.value;

    setLoadingTransfer(LoadingState.loading);

    userTransferChain(transferFromChainUID, transferToChainUID, transferUserUID)
      .then(async () => {
        setLoadingTransfer(LoadingState.success);
        refSelectTransferParticipant.current.value = "";
        refSelectTransferChain.current.value = "";
        await Sleep(1500);
        setLoadingTransfer(LoadingState.idle);
      })
      .catch(async (err) => {
        setLoadingTransfer(LoadingState.error);
        addToastError(
          `Unable to transfer participant to another loop`,
          err?.status
        );
        await Sleep(1500);
        setLoadingTransfer(LoadingState.idle);
      })
      .finally(() => {
        refresh(false);
      });
  }

  function optimizeRoute(chainUID: UID) {
    routeOptimizeOrder(chainUID)
      .then((res) => {
        const optimal_path = res.data.optimal_path;

        // saving current rooute before changing in the database
        setPreviousRoute(route);
        setRouteWasOptimized(true);
        // set new order
        routeSetOrder(chainUID, optimal_path);
        setRoute(optimal_path);
      })
      .catch((err) => {
        addToastError(GinParseErrors(t, err), err.status);
      });
  }

  function returnToPreviousRoute(chainUID: UID) {
    setRoute(previousRoute);
    setRouteWasOptimized(false);
    routeSetOrder(chainUID, previousRoute!);
  }

  useEffect(() => {
    refresh(true);
  }, [history, authUser]);

  const [filteredUsersHost, filteredUsersNotHost] = useMemo(() => {
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
    const bagGetAll = authUser
      ? bagGetAllByChain(chainUID, authUser.uid)
      : Promise.reject("authUser not set");

    try {
      let _hostChains: Chain[];
      if (authUser?.is_root_admin) {
        _hostChains = (
          await chainGetAll({ filter_out_unpublished: false })
        ).data.filter((c) => c.uid !== chainUID);
      } else {
        _hostChains = (
          await Promise.all(
            authUser?.chains
              .filter((uc) => uc.is_chain_admin && uc.chain_uid !== chainUID)
              .map((uc) => chainGet(uc.chain_uid)) || []
          )
        ).map((c) => c.data);
      }
      setHostChains(_hostChains.sort((a, b) => a.name.localeCompare(b.name)));

      const [chainData, chainUsers, routeData, bagData] = await Promise.all([
        chainGet(chainUID),
        userGetAllByChain(chainUID),
        routeGetOrder(chainUID),
        bagGetAll,
      ]);
      setChain(chainData.data);
      setRoute(routeData.data || []);
      setUsers(
        chainUsers.data.filter(
          (u) => u.chains.find((uc) => uc.chain_uid == chainUID)?.is_approved
        )
      );
      setBags(bagData.data || []);
      let _unapprovedUsers = chainUsers.data.filter(
        (u) =>
          u.chains.find((uc) => uc.chain_uid == chainUID)?.is_approved == false
      );
      setUnapprovedUsers(_unapprovedUsers);
      if (firstPageLoad && _unapprovedUsers.length)
        setSelectedTable("unapproved");
      setPublished(chainData.data.published);
      setOpenToNewMembers(chainData.data.open_to_new_members);
    } catch (err: any) {
      if (Array.isArray(err)) err = err[0];
      if (err?.status === 401) {
        history.replace("/loops");
      }
    }
  }

  if (!(chain && users && unapprovedUsers && route && bags)) {
    console.log(chain, users, unapprovedUsers, route, bags);
    return null;
  }

  let shareLink = `${VITE_BASE_URL}/loops/${chainUID}/users/signup`;

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

  return (
    <>
      <Helmet>
        <title>The Clothing Loop | Loop Members</title>
        <meta name="description" content="Loop Members" />
      </Helmet>

      <main>
        <div className="flex flex-col lg:flex-row max-w-screen-xl mx-auto pt-4 lg:mb-6">
          <section className="lg:w-1/3">
            <div className="relative bg-teal-light p-8">
              <label className="absolute top-4 right-4">
                <a
                  {...addCopyAttributes(
                    t,
                    "loop-detail-share",
                    "relative btn btn-circle btn-secondary tooltip flex group",
                    shareLink
                  )}
                  href={shareLink}
                >
                  <span className="feather feather-share text-lg" />
                  <span className="absolute top-full -mt-1 group-hover:mt-1 text-xs bg-secondary shadow-lg rounded-sm py-1 px-2  whitespace-nowrap group-hover:bg-secondary-focus transition-all opacity-40 group-hover:opacity-100">
                    {t("shareLink")}
                  </span>
                </a>
              </label>

              <h1 className="font-serif font-bold text-secondary mb-6 pr-10 text-4xl break-words">
                {chain.name}
              </h1>
              <p className="text-lg mb-6 break-words">{chain.description}</p>

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

              {isUserAdmin || authUser?.is_root_admin ? (
                <>
                  <div className="mt-4">
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
                  </div>

                  <div className="text-center">
                    <Link
                      className="btn btn-sm btn-secondary mt-4 w-full md:w-[120px]"
                      to={`/loops/${chainUID}/edit`}
                    >
                      {t("editLoop")}
                      <span
                        className="ltr:ml-2 rtl:mr-2 feather feather-edit-2"
                        aria-hidden
                      />
                    </Link>
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
                  onChange={(e) => setSelectedTable("route")}
                  className="hidden peer"
                />
                <div className="relative btn no-animation bg-transparent hover:bg-black hover:text-secondary-content transition-none text-black ltr:pr-3 rtl:pl-3 ltr:mr-3 rtl:ml-3 border-0 peer-checked:btn-secondary peer-checked:hover:bg-secondary">
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
                  onChange={(e) => setSelectedTable("participants")}
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
                  onChange={(e) => {
                    if (unapprovedUsers.length) setSelectedTable("unapproved");
                  }}
                  disabled={!unapprovedUsers.length}
                  className="hidden peer"
                />
                <div
                  className={`relative btn no-animation bg-transparent hover:bg-black hover:text-secondary-content transition-none ltr:pl-3 rtl:pr-3 ltr:ml-3 rtl:mr-3 border-0 peer-checked:btn-secondary peer-checked:hover:bg-secondary ${
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
            <div className="order-2 md:justify-self-end md:self md:order-3">
              {selectedTable === "route" ? (
                !routeWasOptimized ? (
                  <button
                    type="button"
                    className="btn btn-secondary btn-outline mr-4 rtl:mr-0 rtl:ml-4"
                    onClick={() => optimizeRoute(chain.uid)}
                  >
                    {t("routeOptimize")}
                    <span className="feather feather-zap ms-3 text-primary" />
                  </button>
                ) : (
                  <button
                    type="button"
                    className="btn btn-secondary btn-outline mr-4 rtl:mr-0 rtl:ml-4"
                    onClick={() => returnToPreviousRoute(chain.uid)}
                  >
                    {t("routeUndoOptimize")}

                    <span className="feather feather-corner-left-up ms-3" />
                  </button>
                )
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
  authUser: User | null;
  chain: Chain;
  filteredUsersHost: User[];
  refresh: () => Promise<void>;
}) {
  const { t } = useTranslation();
  const { addToastError, addModal } = useContext(ToastContext);

  function getEditLocation(u: User): LocationDescriptor {
    if (!u.uid) return "#";

    return {
      pathname: `/users/${u.uid}/edit`,
      state: {
        chainUID: props.chain.uid,
      },
    };
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
    <Link to={getEditLocation(u)}>{t("edit")}</Link>,
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
                    classes="dropdown-right"
                    items={dropdownItems(u)}
                  />
                </td>
                <td>{u.name}</td>
                <td>{u.email}</td>
                <td>{u.phone_number}</td>
                <td className="text-right hidden md:table-cell">
                  <DropdownMenu
                    classes="dropdown-left"
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
  authUser: User | null;
  unapprovedUsers: User[];
  chain: Chain;
  refresh: () => Promise<void>;
}) {
  const { t, i18n } = useTranslation();
  const { addToastError, addModal } = useContext(ToastContext);

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
                          classes="dropdown-right"
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
  authUser: User | null;
  users: User[];
  sortBy: ParticipantsSortBy;
  setSortBy: (sortBy: ParticipantsSortBy) => void;
  chain: Chain;
  refresh: () => Promise<void>;
  hostChains: Chain[];
}) {
  const { t, i18n } = useTranslation();
  const { addToastError, addModal } = useContext(ToastContext);

  function getEditLocation(user: User): LocationDescriptor {
    if (!user.uid) {
      addToastError("Edit button coundn't find user of: " + user.name, 500);
      return "#";
    }

    return {
      pathname: `/users/${user.uid}/edit`,
      state: {
        chainUID: props.chain.uid,
      },
    };
  }

  function onRemove(user: User) {
    const chainUID = props.chain.uid;

    addModal({
      message: t("areYouSureRemoveParticipant", { name: user.name }),
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
          <span className="feather feather-user inline-block mr-1" />
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
  function onTransfer(user: User) {
    addModal({
      message: t("transferParticipantToLoop"),
      content: () => (
        <div>
          <div className="flex flex-col items-center">
            <PopoverOnHover
              message={t("transferParticipantInfo")}
              className="absolute top-5 ltr:right-4 rtl:left-4 tooltip-left rtl:tooltip-right"
            />
            <p className="mb-4">
              <span className="feather feather-user inline-block mr-1" />
              {user.name}
            </p>
            <p className="mb-1 font-semibold text-sm">{props.chain.name}</p>
            <span className="feather feather-arrow-down inline-block mb-1" />
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
          text: t("transfer"),
          type: "success",
          submit: true,
          fn(formValues) {
            let toChainUID = formValues?.loop || "";

            if (!toChainUID) return Error("Invalid loop");

            userTransferChain(props.chain.uid, toChainUID, user.uid)
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
                    className="ml-1"
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
                    className="ml-1"
                    onClick={() => toggleSortBy("email")}
                  />
                </th>
                <th>{t("phone")}</th>
                <th>{t("interestedSizes")}</th>
                <th>
                  <span>{t("signedUpOn")}</span>
                  <SortButton
                    isSelected={props.sortBy === "date"}
                    className="ml-1"
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
                  <Link to={getEditLocation(u)}>{t("edit")}</Link>,
                  ...(!userChain.is_chain_admin || props.authUser?.is_root_admin
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
                          onClick={() => onTransfer(u)}
                          className="text-red"
                        >
                          {t("transfer")}
                        </button>,
                      ]
                    : []),
                ];

                let dropdownClasses = "dropdown-right";
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
  authUser: User | null;
  users: User[];
  chain: Chain;
  route: UID[];
  bags: Bag[];
  setRoute: (route: UID[]) => void;
  refresh: () => Promise<void>;
  onGoToEditTableItem: (uid: UID) => void;
}) {
  const { t } = useTranslation();
  const [dragging, setDragging] = useState<string>("");
  const [dragTarget, setDragTarget] = useState<string>("");

  function setRoute(r: typeof props.route) {
    routeSetOrder(props.chain.uid, r);
    props.setRoute(r);
  }
  function draggingEnd(e: DragEvent<HTMLTableRowElement>) {
    const fromIndex = props.route.indexOf(dragging);
    const toIndex = props.route.indexOf(dragTarget);

    setDragTarget("");
    setRoute(reOrder(props.route, fromIndex, toIndex));
  }
  function handleInputChangeRoute(e: ChangeEvent<HTMLInputElement>, uid: UID) {
    const toIndex = e.target.valueAsNumber - 1;
    const fromIndex = props.route.indexOf(uid);
    setRoute(reOrder(props.route, fromIndex, toIndex));
  }

  return (
    <>
      <div className="mt-6 relative overflow-hidden">
        <div className="overflow-x-auto">
          <table className="table table-compact w-full mb-10">
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
                const routeOrderNumber = i + 1;

                let classTdDragging = dragging === u.uid ? "bg-grey/[.1]" : "";
                if (dragTarget === u.uid) {
                  const orderTarget = props.route.indexOf(dragTarget);
                  const orderDrag = props.route.indexOf(dragging);

                  if (orderTarget < orderDrag) {
                    classTdDragging += " border-t-2 border-t-grey";
                  } else {
                    classTdDragging += " border-b-2 border-b-grey";
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
                    draggable
                    className="[&>td]:hover:bg-base-200/[0.6] group"
                  >
                    <td className={`${classTdDragging} text-center`}>
                      <span className="hidden lg:inline-block py-1 px-2 bg-base-200 rounded-lg font-semibold">
                        {routeOrderNumber}
                      </span>
                      <input
                        onClick={(e) => (e.target as any).select()}
                        onChange={(e) => handleInputChangeRoute(e, u.uid)}
                        max={props.route.length + 1}
                        min={1}
                        type="number"
                        className="inline-block lg:hidden input-reset w-14 py-1 px-2 bg-base-200 rounded-lg font-semibold text-center"
                        value={routeOrderNumber}
                      />

                      <div
                        tabIndex={0}
                        aria-label="drag"
                        className="hidden lg:inline-block p-1 ml-2 rounded-full hover:bg-white cursor-grab active:cursor-grabbing feather feather-maximize-2 -rotate-45"
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
                        className="btn btn-circle btn-sm btn-ghost bg-base-100 feather feather-info"
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
      aria-label={t("sort")}
      className={
        "btn btn-xs btn-circle feather feather-chevrons-down " +
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
        <span className="text-xl feather feather-more-vertical" />
      </label>
      <ul
        tabIndex={0}
        className={"dropdown-content menu shadow bg-base-100 font-bold text-teal ".concat(
          props.items.length === 1 ? "h-full" : ""
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
        className="relative w-8 h-8 flex items-center justify-center feather feather-shopping-bag scale-[0.9] text-xl text-white rounded-full cursor-pointer transition-transform group-active/bag:scale-[0.7]"
        style={{
          backgroundColor: firstBag.color,
        }}
      ></div>
    );
  }

  return (
    <div className="dropdown ltr:dropdown-right rtl:dropdown-left">
      <div aria-label={t("bag")} className="h-full group/bag" tabIndex={0}>
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
