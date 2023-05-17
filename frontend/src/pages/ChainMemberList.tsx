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
  chainRemoveUser,
  chainUpdate,
  chainUserApprove,
  UnapprovedReason,
} from "../api/chain";
import { Chain, UID, User, UserChain } from "../api/types";
import { userGetAllByChain } from "../api/user";
import { ToastContext } from "../providers/ToastProvider";
import { SizeBadges } from "../components/Badges";
import FormJup from "../util/form-jup";
import { GinParseErrors } from "../util/gin-errors";
import { routeGetOrder, routeSetOrder } from "../api/route";
import useToClipboard from "../util/to-clipboard.hooks";

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
  const { addToastError } = useContext(ToastContext);

  const [chain, setChain] = useState<Chain | null>(null);
  const [users, setUsers] = useState<User[] | null>(null);
  const [route, setRoute] = useState<UID[] | null>(null);
  const [participantsSortBy, setParticipantsSortBy] =
    useState<ParticipantsSortBy>("date");
  const [unapprovedUsers, setUnapprovedUsers] = useState<User[] | null>(null);
  const [published, setPublished] = useState(true);
  const [openToNewMembers, setOpenToNewMembers] = useState(true);
  const [error, setError] = useState("");
  const [selectedTable, setSelectedTable] = useState<SelectedTable>("route");
  const refSelect: any = useRef<HTMLSelectElement>();
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
    setPublished(isChecked);

    try {
      await chainUpdate({
        uid: chainUID,
        published: isChecked,
      });
    } catch (err: any) {
      console.error("Error updating chain: ", err);
      setError(err?.data || `Error: ${JSON.stringify(err)}`);
      setPublished(oldValue);
    }
  }

  async function handleChangeOpenToNewMembers(
    e: ChangeEvent<HTMLInputElement>
  ) {
    let isChecked = e.target.checked;
    let oldValue = openToNewMembers;
    setOpenToNewMembers(isChecked);

    try {
      await chainUpdate({
        uid: chainUID,
        open_to_new_members: isChecked,
      });
    } catch (err: any) {
      console.error("Error updating chain:", err);
      setError(err?.data || `Error: ${JSON.stringify(err)}`);
      setOpenToNewMembers(oldValue);
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
        (refSelect.current as HTMLSelectElement).value = "";
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

  useEffect(() => {
    refresh(true);
  }, [history]);

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
    try {
      const [chainData, chainUsers, routeData] = await Promise.all([
        chainGet(chainUID),
        userGetAllByChain(chainUID),
        routeGetOrder(chainUID),
      ]);
      setChain(chainData.data);
      setRoute(routeData.data || []);
      setUsers(
        chainUsers.data.filter(
          (u) => u.chains.find((uc) => uc.chain_uid == chainUID)?.is_approved
        )
      );
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

  if (!(chain && users && unapprovedUsers && route)) {
    console.log(chain, users, unapprovedUsers);
    return null;
  }

  let shareLink = `${VITE_BASE_URL}/loops/${chainUID}/users/signup`;

  let userChain = authUser?.chains.find((uc) => uc.chain_uid === chain.uid);
  let isUserAdmin = userChain?.is_chain_admin || false;

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
            {isUserAdmin || authUser?.is_root_admin ? (
              <div className="flex flex-col md:flex-row bg-teal-light py-3 px-4 mt-4">
                <div className="flex flex-col w-full md:w-1/3 pr-6">
                  <div className="form-control w-full">
                    <label className="cursor-pointer label">
                      <span className="label-text">
                        {published ? t("published") : t("draft")}
                      </span>
                      <input
                        type="checkbox"
                        className={`toggle toggle-secondary ${
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
                        {openToNewMembers ? t("openToNewMembers") : t("closed")}
                      </span>
                      <input
                        type="checkbox"
                        className={`toggle toggle-secondary ${
                          error === "openToNewMembers" ? "border-error" : ""
                        }`}
                        name="openToNewMembers"
                        checked={openToNewMembers}
                        onChange={handleChangeOpenToNewMembers}
                      />
                    </label>
                  </div>
                </div>

                <div className="flex flex-col w-full md:w-2/3 items-end ml-auto pt-1">
                  <form className="w-full flex flex-row" onSubmit={onAddCoHost}>
                    <div className="w-full ml-auto">
                      <select
                        className="w-full select select-sm rounded-none disabled:text-base-300 border-2 border-black"
                        name="participant"
                        ref={refSelect}
                        disabled={filteredUsersNotHost.length === 0}
                      >
                        <option disabled selected value="">
                          {t("selectParticipant")}
                        </option>
                        {filteredUsersNotHost?.map((u) => (
                          <option key={u.uid} value={u.uid}>
                            {u.name} {u.email}
                          </option>
                        ))}
                      </select>
                    </div>
                    <button
                      className={`btn btn-sm rounded-none w-[120px] ${
                        filteredUsersNotHost.length === 0
                          ? "btn-disabled"
                          : "btn-primary"
                      }`}
                      type="submit"
                    >
                      {t("addCoHost")}
                    </button>
                  </form>
                  <Link
                    className="btn btn-sm btn-primary mt-4 w-[120px]"
                    to={`/loops/${chainUID}/edit`}
                  >
                    {t("editLoop")}
                    <span
                      className="ltr:ml-2 rtl:mr-2 feather feather-edit-2"
                      aria-hidden
                    />
                  </Link>
                </div>
              </div>
            ) : null}
          </section>
        </div>

        <div className="max-w-screen-xl mx-auto px-2 sm:px-8">
          <div className="grid gap-4 sm:grid-cols-3 justify-items-center sm:justify-items-start">
            <h2 className="order-1 sm:col-span-3 lg:col-span-1 font-semibold text-secondary self-center text-3xl">
              {t("loopParticipant", {
                count: unapprovedUsers.length + users.length,
              })}
            </h2>

            <div className="order-3 sm:col-span-2 sm:order-2 lg:col-span-1 lg:justify-self-center flex border border-secondary bg-teal-light">
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
            <div className="order-2 sm:justify-self-end sm:self sm:order-3">
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
              refresh={refresh}
            />
          ) : (
            <RouteTable
              key="route"
              authUser={authUser}
              users={routeSortUsers}
              chain={chain}
              route={route}
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
              <tr key={u.uid} className="[&_td]:hover:bg-base-200/[0.6]">
                <td className="md:hidden !px-0">
                  <DropdownMenu
                    direction="dropdown-right"
                    items={dropdownItems(u)}
                  />
                </td>
                <td>{u.name}</td>
                <td>{u.email}</td>
                <td>{u.phone_number}</td>
                <td className="text-right hidden md:table-cell">
                  <DropdownMenu
                    direction="dropdown-left"
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
          if (window.goatcounter)
            window.goatcounter.count({
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
                          ? "[&>td]:bg-red/[.5] [&_td]:hover:bg-red/[.3]"
                          : "[&>td]:bg-yellow/[.6] [&_td]:hover:bg-yellow/[.4]"
                      }
                    >
                      <td className="lg:hidden !px-0">
                        <DropdownMenu
                          direction="dropdown-right"
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

  function onRemove(e: MouseEvent, user: User) {
    e.preventDefault();

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
              {props.users.map((u: User) => {
                const userChain = getUserChain(u);

                return (
                  <tr
                    key={u.uid}
                    data-uid={u.uid}
                    tabIndex={-1}
                    className="[&_td]:hover:bg-base-200/[0.6] [&_td]:focus:bg-primary/[0.3] group"
                  >
                    <td className="!px-0">
                      <DropdownMenu
                        direction="dropdown-right"
                        items={[
                          <button
                            type="button"
                            onClick={(e) => onRemove(e, u)}
                            className="text-red"
                          >
                            {t("removeFromLoop")}
                          </button>,
                          <Link to={getEditLocation(u)}>{t("edit")}</Link>,
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
                <th className="w-[0.1%]" colSpan={1}>
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
                return (
                  <tr
                    key={u.uid}
                    onDragStart={() => setDragging(u.uid)}
                    onDrag={() => setDragging(u.uid)}
                    onDragEnd={draggingEnd}
                    onDragOver={() => setDragTarget(u.uid)}
                    draggable
                    className="[&_td]:hover:bg-base-200/[0.6] group"
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
                    {/* <td
                      className={`${classTdDragging} !p-0 relative min-h-[1px]`}
                    >
                      <div aria-label="bag" className="h-full">
                        <div className="z-0 absolute inset-0 flex flex-col">
                          <span className="h-1/2 w-0 mx-auto border-x-4 border-teal group-first-of-type:invisible"></span>
                          <span className="h-1/2 w-0 mx-auto border-x-4 border-teal group-last-of-type:invisible"></span>
                        </div>
                        <div className="z-10 relative w-8 h-8 flex items-center justify-center feather feather-shopping-bag text-white bg-teal rounded-full"></div>
                      </div>
                    </td> */}
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

function DropdownMenu(props: {
  items: ReactElement[];
  direction: "dropdown-left" | "dropdown-right";
}) {
  return (
    <div className={"dropdown ".concat(props.direction)}>
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
