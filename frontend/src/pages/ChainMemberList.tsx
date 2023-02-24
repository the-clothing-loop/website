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
} from "react";

import { useParams, Link, useHistory } from "react-router-dom";
import type { LocationDescriptor } from "history";
import { Helmet } from "react-helmet";
import { useTranslation } from "react-i18next";
import dayjs from "dayjs";

import { AuthContext, AuthProps } from "../providers/AuthProvider";
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
import { Chain, User, UserChain } from "../api/types";
import { userGetAllByChain } from "../api/user";
import { ToastContext } from "../providers/ToastProvider";
import { GenderBadges, SizeBadges } from "../components/Badges";
import FormJup from "../util/form-jup";
import { GinParseErrors } from "../util/gin-errors";
import { routeGetOrder, routeSetOrder } from "../api/route";
import { count } from "console";

interface Params {
  chainUID: string;
}

export default function ChainMemberList() {
  const history = useHistory();
  const { t } = useTranslation();
  const { chainUID } = useParams<Params>();
  const { authUser } = useContext(AuthContext);
  const { addToastError } = useContext(ToastContext);

  const [chain, setChain] = useState<Chain | null>(null);
  const [users, setUsers] = useState<User[] | null>(null);
  const [unapprovedUsers, setUnapprovedUsers] = useState<User[] | null>(null);
  const [published, setPublished] = useState(true);
  const [openToNewMembers, setOpenToNewMembers] = useState(true);
  const [error, setError] = useState("");
  const refSelect: any = useRef<HTMLSelectElement>();

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
      console.error(`Error updating chain: ${JSON.stringify(err)}`);
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

  useEffect(() => {
    refresh();
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

  async function refresh() {
    try {
      const [chainData, chainUsers] = await Promise.all([
        chainGet(chainUID),
        userGetAllByChain(chainUID),
      ]);
      setChain(chainData.data);
      setUsers(
        chainUsers.data.filter(
          (u) => u.chains.find((uc) => uc.chain_uid == chainUID)?.is_approved
        )
      );
      setUnapprovedUsers(
        chainUsers.data.filter(
          (u) =>
            u.chains.find((uc) => uc.chain_uid == chainUID)?.is_approved ==
            false
        )
      );
      setPublished(chainData.data.published);
      setOpenToNewMembers(chainData.data.open_to_new_members);
    } catch (err: any) {
      if (Array.isArray(err)) err = err[0];
      if (err?.status === 401) {
        history.replace("/loops");
      }
    }
  }

  if (!(chain && users && unapprovedUsers)) {
    console.log(chain, users, unapprovedUsers);
    return null;
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
              <Link
                className="absolute top-4 right-4 btn btn-outline btn-circle"
                to={`/loops/${chainUID}/edit`}
              >
                <span className="feather feather-edit-2" />
              </Link>

              <h1 className="font-serif font-bold text-secondary mb-6 pr-10 text-4xl break-words">
                {chain.name}
              </h1>
              <p className="text-lg mb-6 break-words">{chain.description}</p>

              <dl>
                <dt className="font-bold mb-1">{t("categories")}</dt>
                <dd className="mb-2">
                  {chain?.genders && GenderBadges(t, chain.genders)}
                </dd>
                <dt className="font-bold mb-1">{t("sizes")}</dt>
                <dd className="mb-2">
                  {chain?.sizes && SizeBadges(t, chain.sizes)}
                </dd>
                <dt className="font-bold mb-2">{t("participants")}</dt>
                <dd className="text-sm mb-1">
                  {t("peopleWithCount", { count: users.length })}
                </dd>
              </dl>

              <div className="flex flex-col">
                <div className="form-control w-full">
                  <label className="cursor-pointer label px-0">
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
                  <label className="cursor-pointer label px-0 -mb-2">
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
            </div>
          </section>

          <section className="lg:w-2/3 relative py-8 px-2 sm:p-8 pt-0 bg-secondary-light">
            <h2 className="font-semibold text-secondary mb-6 text-3xl">
              Loop Admin
            </h2>
            <HostTable
              authUser={authUser}
              filteredUsersHost={filteredUsersHost}
              chain={chain}
              refresh={refresh}
            />
            <div className="flex justify-end">
              <form
                className="w-full md:w-1/2 flex flex-col sm:flex-row items-stretch md:pl-6"
                onSubmit={onAddCoHost}
              >
                <div className="flex-grow">
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
                  className={`btn btn-sm rounded-none ${
                    filteredUsersNotHost.length === 0
                      ? "btn-disabled"
                      : "btn-primary"
                  }`}
                  type="submit"
                >
                  {t("addCoHost")}
                </button>
              </form>
            </div>
          </section>
        </div>

        <div className="max-w-screen-xl mx-auto px-2 sm:px-8">
          <h2 className="font-semibold text-secondary text-3xl mb-6">
            Loop Participants
          </h2>
          <UserDataExport chainName={chain.name} chainUsers={users} />

          <ParticipantsTable
            authUser={authUser}
            users={users}
            unapprovedUsers={unapprovedUsers}
            chain={chain}
            refresh={refresh}
          />
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
          type: "ghost",
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

function ParticipantsTable(props: {
  authUser: User | null;
  users: User[];
  unapprovedUsers: User[];
  chain: Chain;
  refresh: () => Promise<void>;
}) {
  const { t, i18n } = useTranslation();
  const { addToastError, addModal } = useContext(ToastContext);
  const [sortBy, setSortBy] = useState<"name" | "email" | "date" | "route">(
    "date"
  );
  const [route, setRoute] = useState<string[]>([]);
  const [dragging, setDragging] = useState<string>("");
  const [dragTarget, setDragTarget] = useState<string>("");

  const dragColor = "bg-grey/[.1]";

  useEffect(() => {
    if (!props.chain) return;
    routeUpdate();
  }, [props.chain]);

  async function routeUpdate() {
    const res = await routeGetOrder(props.chain.uid);
    setRoute(res.data);
    console.log(route);
  }

  async function routePop(userUID: string) {
    let chainRoute = new Array();
    if (route != null) {
      chainRoute = route;
    }
    console.log(chainRoute);

    const toPop = route?.indexOf(userUID);
    if (toPop) {
      chainRoute.splice(toPop, 1);
      console.log(chainRoute);
      setRoute(chainRoute);
    }
    return;
  }

  async function changeRoute() {
    await routeSetOrder(props.chain.uid, route);
  }
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
          type: "ghost",
          fn: () => {
            chainRemoveUser(chainUID, user.uid)
              .catch((err) => {
                addToastError(GinParseErrors(t, err), err.status);
              })
              .finally(() => {
                routePop(user.uid);
                changeRoute();
                props.refresh();
              });
          },
        },
      ],
    });
  }

  function onApprove(e: MouseEvent, user: User) {
    e.preventDefault();

    const chainUID = props.chain.uid;

    addModal({
      message: t("approveParticipant", { name: user.name }),
      actions: [
        {
          text: t("approve"),
          type: "ghost",
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
              .finally(() => {
                changeRoute();
                return props.refresh();
              });
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

  function simplifyDays(uc: UserChain): string {
    var numDays = dayjs().diff(dayjs(uc.created_at), "days");

    if (numDays < 1) {
      return t("new");
    } else if (numDays < 7) {
      return t("nDays", { n: numDays });
    } else {
      let locale = i18n.language;
      if (locale === "en") locale = "default";

      return new Date(uc.created_at).toLocaleDateString(locale);
    }
  }

  function getUserChain(u: User): UserChain {
    return u.chains.find((uc) => uc.chain_uid === props.chain.uid)!;
  }

  function sortOrder(_sortBy: typeof sortBy): User[] {
    switch (_sortBy) {
      case "email":
      case "name":
        return props.users.sort((a, b) =>
          a[_sortBy].localeCompare(b[_sortBy]) == 1 ? 1 : -1
        );
      case "date":
        return props.users.sort((a, b) => {
          const ucA = getUserChain(a);
          const ucB = getUserChain(b);

          return new Date(ucA.created_at) > new Date(ucB.created_at) ? -1 : 1;
        });
      case "route":
        return props.users.sort((a, b) => {
          return route.indexOf(a.uid) < route.indexOf(b.uid) ? -1 : 1;
        });
    }
  }

  function toggleSortBy(_sortBy: typeof sortBy) {
    setSortBy(sortBy !== _sortBy ? _sortBy : "date");
  }
  function draggingEnd(evt: string) {
    let newRoute: string[] = route;

    const userA = route.indexOf(dragging);
    const userB = route.indexOf(dragTarget);

    newRoute[userA] = newRoute[userB];
    newRoute[userB] = dragging;

    setDragTarget("");
    setRoute(newRoute);
    changeRoute();
  }

  return (
    <>
      <div className="mt-10 relative overflow-hidden">
        <div className="overflow-x-auto">
          <table className="table table-compact w-full mb-10">
            <thead>
              <tr>
                <th className="md:hidden w-[0.1%]"></th>
                <th>
                  <span>{t("name")}</span>
                  <SortButton
                    isSelected={sortBy === "name"}
                    className="ml-1"
                    onClick={() => toggleSortBy("name")}
                  />
                </th>
                <th>
                  <span>{t("address")}</span>
                </th>
                <th>
                  <span>{t("contact")}</span>
                  <SortButton
                    isSelected={sortBy === "email"}
                    className="ml-1"
                    onClick={() => toggleSortBy("email")}
                  />
                </th>
                <th>
                  <span>{t("interestedSizes")}</span>
                </th>
                <th>
                  <span>{t("signedUpOn")}</span>
                  <SortButton
                    isSelected={sortBy === "date"}
                    className="ml-1"
                    onClick={() => toggleSortBy("date")}
                  />
                </th>
                <th className="hidden md:table-cell w-[0.1%]"></th>
                <td>
                        <span>{t("Route")}</span>
                        <SortButton
                          isSelected={sortBy === "route"}
                          className="ml-1"
                          onClick={() => {
                            toggleSortBy("route");
                          }}
                        />
                  </td>
              </tr>
            </thead>
            <tbody>
              {props.unapprovedUsers
                .sort((a, b) => {
                  const ucA = getUserChain(a);
                  const ucB = getUserChain(b);

                  return new Date(ucA.created_at) > new Date(ucB.created_at)
                    ? -1
                    : 1;
                })
                .map((u) => {
                  const userChain = getUserChain(u);
                  const dropdownItems = userChain
                    ? [
                        <button type="button" onClick={(e) => onApprove(e, u)}>
                          {t("approve")}
                        </button>,
                        <button
                          type="button"
                          onClick={(e) => onDeny(e, u)}
                          className="text-red"
                        >
                          {t("deny")}
                        </button>,
                      ]
                    : [];

                  return (
                    <tr
                      key={u.uid}
                      className="[&>td]:bg-yellow/[.6] [&_td]:hover:bg-yellow/[.4]"
                    >
                      <td className="md:hidden !px-0">
                        <DropdownMenu
                          direction="dropdown-right"
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
                        {u.email}
                        <br />
                        {u.phone_number}
                      </td>
                      <td></td>
                      <td className="text-center">{t("pendingApproval")}</td>
                      <td
                      className={`text-center ${
                        u.uid == dragTarget ? dragColor : ""
                      }`}
                    >
                      {"N/A"}
                    </td>
                      <td className="text-right hidden md:table-cell">
                        <DropdownMenu
                          direction="dropdown-left"
                          items={dropdownItems}
                        />
                      </td>
                    </tr>
                  );
                })}
              {sortOrder(sortBy).map((u: User) => {
                const userChain = getUserChain(u);
                const routeOrderNumber = route.indexOf(u.uid) + 1;

                const dropdownItems = [
                  <button
                    type="button"
                    onClick={(e) => onRemove(e, u)}
                    className="text-red"
                  >
                    {t("removeFromLoop")}
                  </button>,
                  <Link to={getEditLocation(u)}>{t("edit")}</Link>,
                ];

                return (
                  <tr
                    key={u.uid}
                    className="[&_td]:hover:bg-base-200/[0.6] group"
                    draggable={sortBy === "route"}
                    onDragStart={() => {
                      setDragging(u.uid);
                    }}
                    onDrag={() => {
                      setDragging(u.uid);
                      console.log(dragging);
                    }}
                    onDragEnd={() => {
                      draggingEnd(u.uid);
                    }}
                    onDragOver={() => {
                      setDragTarget(u.uid);
                    }}
                  >
                    <td className="md:hidden !px-0">
                      <DropdownMenu
                        direction="dropdown-right"
                        items={dropdownItems}
                      />
                    </td>
                    <td className={`${u.uid == dragTarget ? dragColor : ""}`}>
                      {u.name}
                    </td>
                    <td className={`${u.uid == dragTarget ? dragColor : ""}`}>
                      <span className="block w-48 text-sm whitespace-normal">
                        {u.address}
                      </span>
                    </td>
                    <td
                      className={`text-sm leading-relaxed ${
                        u.uid == dragTarget ? dragColor : ""
                      }`}
                    >
                      {u.email}
                      <br />
                      {u.phone_number}
                    </td>
                    <td
                      className={`align-middle ${
                        u.uid == dragTarget ? dragColor : ""
                      }`}
                    >
                      <span
                        className={`block min-w-[12rem] bg-base-100 rounded-lg whitespace-normal [&_span]:mb-2 -mb-2  ${
                          u.uid == dragTarget ? "bg-grey/[.02]" : ""
                        }`}
                        tabIndex={0}
                      >
                        {SizeBadges(t, u.sizes)}
                      </span>
                    </td>
                    <td
                      className={`text-center ${
                        u.uid == dragTarget ? dragColor : ""
                      }`}
                    >
                      {simplifyDays(userChain)}
                    </td>
                    <td
                      className={`text-center ${
                        u.uid == dragTarget ? dragColor : ""
                      }`}
                    >
                      {routeOrderNumber > 0 ? routeOrderNumber : ""}
                    </td>
                    <td className="text-right hidden md:table-cell">
                      <DropdownMenu
                        direction="dropdown-left"
                        items={dropdownItems}
                      />
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
