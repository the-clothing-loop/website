import {
  useState,
  useEffect,
  useContext,
  ChangeEvent,
  useMemo,
  FormEvent,
  useRef,
  MouseEventHandler,
} from "react";
import { useParams, Link, useHistory } from "react-router-dom";
import type { LocationDescriptor } from "history";
import { Helmet } from "react-helmet";
import { useTranslation } from "react-i18next";
import { AuthContext, AuthProps } from "../providers/AuthProvider";
import { UserDataExport } from "../components/DataExport";
import {
  chainAddUser,
  chainDeleteUnapproved,
  chainGet,
  chainRemoveUser,
  chainUpdate,
  chainUserApprove,
} from "../api/chain";
import { Chain, User, UserChain } from "../api/types";
import { userGetAllByChain } from "../api/user";
import { ToastContext } from "../providers/ToastProvider";
import { GenderBadges, SizeBadges } from "../components/Badges";
import FormJup from "../util/form-jup";
import { GinParseErrors } from "../util/gin-errors";

interface Params {
  chainUID: string;
}

export default function ChainMemberList() {
  const history = useHistory();
  const { t } = useTranslation();
  const { chainUID } = useParams<Params>();
  const { authUser } = useContext<AuthProps>(AuthContext);

  const [chain, setChain] = useState<Chain | null>(null);
  const [users, setUsers] = useState<User[] | null>(null);
  const [unapprovedUsers, setUnapprovedUsers] = useState<User[] | null>(null);

  const [published, setPublished] = useState(true);
  const [openToNewMembers, setOpenToNewMembers] = useState(true);
  const [error, setError] = useState("");

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

  useEffect(() => {
    refresh();
  }, [history]);

  async function refresh() {
    try {
      const chainData = (await chainGet(chainUID)).data;
      setChain(chainData);
      const chainUsers = (await userGetAllByChain(chainUID)).data;
      setUsers(
        chainUsers.filter(
          (u) => u.chains.find((uc) => uc.chain_uid == chainUID)?.is_approved
        )
      );
      setUnapprovedUsers(
        chainUsers.filter(
          (u) =>
            u.chains.find((uc) => uc.chain_uid == chainUID)?.is_approved ==
            false
        )
      );
      setPublished(chainData.published);
      setOpenToNewMembers(chainData.open_to_new_members);
    } catch (err: any) {
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
          <section className="lg:w-1/3 mb-6 lg:mb-0">
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

          <HostTable
            authUser={authUser}
            users={users}
            chain={chain}
            refresh={refresh}
          />
        </div>

        <div className="max-w-screen-xl mx-auto px-8">
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
  users: User[];
  refresh: () => Promise<void>;
}) {
  const { t } = useTranslation();
  const { addToastError, addToastStatic } = useContext(ToastContext);

  const refSelect: any = useRef<HTMLSelectElement>();
  const [selected, setSelected] = useState("");

  const [filteredUsersHost, filteredUsersNotHost] = useMemo(() => {
    let host: User[] = [];
    let notHost: User[] = [];
    props.users?.forEach((u) => {
      let uc = u.chains.find((uc) => uc.chain_uid === props.chain?.uid);
      if (uc?.is_chain_admin) host.push(u);
      else notHost.push(u);
    });

    return [host, notHost];
  }, [props.users, props.chain]);

  const editHost = useMemo<LocationDescriptor<{ chainUID: string }>>(() => {
    if (!selected) {
      return "#";
    }
    let userUID = props.users?.find((u) => u.uid === selected)?.uid;
    if (!userUID) {
      addToastError("Edit button coundn't find user of: " + selected, 500);
    }

    return {
      pathname: `/users/${userUID}/edit`,
      state: {
        chainUID: props.chain.uid,
      },
    };
  }, [selected, props.users, props.chain]);

  function onChangeSelect(e: ChangeEvent<HTMLInputElement>) {
    if (e.target.checked) setSelected(e.target.value);
    else setSelected("");
  }

  function onDemote() {
    if (!selected) return;
    const _selected = selected;
    const chainUID = props.chain.uid;
    const userName = props.users.find((u) => u.uid === _selected)?.name || "";

    addToastStatic({
      message: t("areYouSureRevokeHost", { name: userName }),
      type: "warning",
      actions: [
        {
          text: t("revoke"),
          type: "ghost",
          fn: () => {
            chainAddUser(chainUID, _selected, false).finally(() => {
              setSelected("");
              return props.refresh();
            });
          },
        },
      ],
    });
  }

  function onAddCoHost(e: FormEvent) {
    e.preventDefault();
    const values = FormJup<{ participant: string }>(e);

    let chainUID = props.chain.uid;
    chainAddUser(chainUID, values.participant, true).finally(() => {
      (refSelect.current as HTMLSelectElement).value = "";
      return props.refresh();
    });
  }

  return (
    <section className="lg:w-2/3 relative p-8 pt-0 bg-secondary-light overflow-hidden">
      <h2 className="font-semibold text-secondary mb-6 max-md:mt-6 text-3xl">
        Loop Admin
      </h2>

      <div className="overflow-x-auto">
        <table className="table w-full">
          <thead>
            <tr>
              <th className="sticky"></th>
              <th>{t("name")}</th>
              <th>{t("email")}</th>
              <th>{t("phone")}</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsersHost
              ?.sort((a, b) => a.name.localeCompare(b.name))
              .map((u) => (
                <tr key={u.uid}>
                  <td className="sticky">
                    <input
                      type="checkbox"
                      name="selectedChainAdmin"
                      className="checkbox checkbox-sm checkbox-primary"
                      checked={selected === u.uid}
                      onChange={onChangeSelect}
                      value={u.uid}
                    />
                  </td>
                  <td>{u.name}</td>
                  <td>{u.email}</td>
                  <td>{u.phone_number}</td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
      <div className="rounded-b-lg w-full flex flex-col md:flex-row justify-between bg-base-200 pb-3 pr-3 ">
        <div className="flex items-center mt-3 ml-3 bg-base-100 rounded-lg p-2">
          <p className={`mx-2 flex-grow ${selected ? "" : "text-base-300"}`}>
            {t("selected")}
          </p>
          <div className="tooltip mr-2" data-tip={t("edit")}>
            <Link
              className={`btn btn-sm btn-circle feather feather-edit ${
                selected.length ? "btn-primary" : "btn-disabled opacity-60"
              }`}
              aria-label={t("edit")}
              aria-disabled={!selected}
              to={editHost}
            ></Link>
          </div>
          <div className="tooltip" data-tip={t("setAsAParticipant")}>
            <button
              type="button"
              onClick={onDemote}
              className={`btn btn-sm btn-circle feather feather-shield-off ${
                selected.length ? "btn-error" : "btn-disabled opacity-60"
              }`}
              aria-label={t("setAsAParticipant")}
              disabled={!selected}
            ></button>
          </div>
        </div>
        <form
          className="flex flex-col md:flex-row items-stretch md:items-end mt-3 ml-3"
          onSubmit={onAddCoHost}
        >
          <select
            className="select select-sm rounded-t-lg md:rounded-l-lg md:rounded-none disabled:text-base-300 md:max-w-xs"
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
          <button
            className={`btn btn-sm rounded-b-lg md:rounded-r-lg md:rounded-none ${
              filteredUsersNotHost.length === 0 ? "btn-disabled" : "btn-primary"
            }`}
            type="submit"
          >
            {t("addCoHost")}
          </button>
        </form>
      </div>
    </section>
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
  const { addToastError, addToastStatic } = useContext(ToastContext);
  const [isSelectApproved, setIsSelectApproved] = useState(false);
  const [selected, setSelected] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<"name" | "email" | "date">("date");

  const edit = useMemo<LocationDescriptor<{ chainUID: string }>>(() => {
    if (selected.length !== 1 || !isSelectApproved) {
      return "#";
    }
    let userUID = props.users?.find((u) => u.uid === selected[0])?.uid;
    if (!userUID) {
      addToastError("Edit button coundn't find user of: " + selected, 500);
    }

    return {
      pathname: `/users/${userUID}/edit`,
      state: {
        chainUID: props.chain.uid,
      },
    };
  }, [selected, props.users, props.chain]);

  function userDenial(){
   if (!selected.length) return;
    const chainUID = props.chain.uid;
    const _selected = selected;
   
    addToastStatic({
      message: t("ReasonForDenyingJoin"),
      type: "info",
      actions: [
        {
          text: t("outOfArea"),
          type: "ghost",
          fn: () => {
            const reason = t("rOutOfArea");
            Promise.all(
              _selected.map((s) => chainDeleteUnapproved(chainUID, s, a)),
            ).finally(() => {
              setSelected([]);
              if (window.goatcounter)
                window.goatcounter.count({
                  path: "deny-user",
                  title: "Deny user",
                  event: true,
                });
                return props.refresh();
            });
          },
        },
        {
          text: t("otherSizesGenders"),
          type: "ghost",
          fn: () => {
            const reason = t("rSizesGenders")
            Promise.all(
              _selected.map((s) => chainDeleteUnapproved(chainUID, s, reason)),
            ).finally(() => {
              setSelected([]);
              if (window.goatcounter)
                window.goatcounter.count({
                  path: "deny-user",
                  title: "Deny user",
                  event: true,
                });
                return props.refresh();
            });
          },
        },
        {
          text: t("other"),
          type: "ghost",
          fn: () => {
            const reason = "rOther"
            Promise.all(
              _selected.map((s) => chainDeleteUnapproved(chainUID, s, reason)),
            ).finally(() => { 
              setSelected([]);
              if (window.goatcounter)
                window.goatcounter.count({
                  path: "deny-user",
                  title: "Deny user",
                  event: true,
                });
                return props.refresh();
            });
          },
        },
      ],
    });
  

  };

  function onChangeSelect(
    e: ChangeEvent<HTMLInputElement>,
    isApproved: boolean
  ) {
    let value = e.target.value;
    let isSelectTypeChanged = isApproved !== isSelectApproved;

    if (isSelectTypeChanged) setSelected([value]);
    else if (e.target.checked) setSelected([...selected, value]);
    else setSelected(selected.filter((s) => s !== value));

    if (isSelectTypeChanged) {
      setIsSelectApproved(isApproved);
    }
  }

  function onRemove() {
    if (!selected.length) return;
    const chainUID = props.chain.uid;
    const _selected = selected;
    const userNames = props.users
      .filter((u) => _selected.includes(u.uid))
      .map((u) => u.name);

    addToastStatic({
      message: t("areYouSureRemoveParticipant", { name: userNames.join(", ") }),
      type: "warning",
      actions: [
        {
          text: t("remove"),
          type: "ghost",
          fn: () => {
            Promise.all(
              _selected.map((s) =>
                chainRemoveUser(chainUID, s).catch((err) => {
                  addToastError(GinParseErrors(t, err), err.status);
                })
              )
            ).finally(() => {
              setSelected([]);
              return props.refresh();
            });
          },
        },
      ],
    });
  }

  function onApprove() {
    if (!selected.length) return;
    const chainUID = props.chain.uid;
    const _selected = selected;
    const userNames = props.unapprovedUsers
      .filter((u) => _selected.includes(u.uid))
      .map((u) => u.name);

    addToastStatic({
      message: t("approveParticipant", { name: userNames.join(", ") }),
      type: "warning",
      actions: [
        {
          text: t("approve"),
          type: "ghost",
          fn: () => {
            Promise.all(
              _selected.map((s) =>
                chainUserApprove(chainUID, s).catch((err) => {
                  addToastError(GinParseErrors(t, err), err.status);
                })
              )
            ).finally(() => {
              setSelected([]);
              if (window.goatcounter)
                window.goatcounter.count({
                  path: "approve-user",
                  title: "Approve user",
                  event: true,
                });
              return props.refresh();
            });
          },
        },
        {
          text: t("deny"),
          type: "ghost",
          fn: () => {
            userDenial();
              return props.refresh();
            }
        },
      ],
    });
  }

  function simplifyDays(uc: UserChain): string {
    var createdAt = new Date(uc.created_at).getTime();
    var currDate = new Date().getTime();
    let numDays = Math.round(((currDate - createdAt) / (10 ** 6 * 864)) * 10);

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
    }
  }

  function toggleSortBy(_sortBy: typeof sortBy) {
    setSortBy(sortBy !== _sortBy ? _sortBy : "date");
  }

  return (
    <>
      <div className="mt-10 relative overflow-hidden">
        <div className="overflow-x-auto">
          <table className="table table-compact w-full">
            <thead>
              <tr>
                <th className="sticky z-0"></th>
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

                  return (
                    <tr key={u.uid}>
                      <td className="bg-yellow/[.6] sticky">
                        <input
                          type="checkbox"
                          name="selectedChainAdmin"
                          className="checkbox checkbox-sm checkbox-accent"
                          checked={selected.includes(u.uid)}
                          onChange={(e) => onChangeSelect(e, false)}
                          value={u.uid}
                        />
                      </td>
                      <td className="bg-yellow/[.6]">{u.name}</td>
                      <td className="bg-yellow/[.6]">
                        <span className="block w-48 text-sm whitespace-normal">
                          {u.address}
                        </span>
                      </td>
                      <td className="bg-yellow/[.6] text-sm leading-relaxed">
                        {u.email}
                        <br />
                        {u.phone_number}
                      </td>
                      <td className="bg-yellow/[.6] align-middle"></td>
                      <td className="bg-yellow/[.6] text-center">
                        {t("pendingApproval")}
                      </td>
                    </tr>
                  );
                })}
              {sortOrder(sortBy).map((u: User) => {
                const userChain = getUserChain(u);

                return (
                  <tr key={u.uid}>
                    <td className="sticky">
                      <input
                        type="checkbox"
                        name="selectedChainAdmin"
                        className="checkbox checkbox-sm checkbox-primary"
                        checked={selected.includes(u.uid)}
                        onChange={(e) => onChangeSelect(e, true)}
                        value={u.uid}
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
                    <td className="align-middle">
                      <span
                        className="block min-w-[12rem] bg-base-100 rounded-lg whitespace-normal [&_span]:mb-2 -mb-2"
                        tabIndex={0}
                      >
                        {SizeBadges(t, u.sizes)}
                      </span>
                    </td>
                    <td className="text-center">{simplifyDays(userChain)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="rounded-b-lg flex flex-col md:flex-row justify-between pb-3 pr-3 bg-base-200 sticky z-10 bottom-0">
          <div className="flex mt-3 ml-3 bg-base-100 rounded-lg p-2">
            <p className="block mx-2 flex-grow">
              <span className="text-2xl font-bold mr-2">{selected.length}</span>
              {t("selected")}
            </p>
            <div className="tooltip mr-2" data-tip={t("edit")}>
              <Link
                className={`btn btn-sm btn-circle feather feather-edit ${
                  selected.length === 1 && isSelectApproved
                    ? "btn-primary"
                    : "btn-disabled opacity-60"
                }`}
                aria-label={t("edit")}
                aria-disabled={!selected || !isSelectApproved}
                to={edit}
              ></Link>
            </div>
            <div className="tooltip mr-2" data-tip={t("removeFromLoop")}>
              <button
                type="button"
                onClick={onRemove}
                className={`btn btn-sm btn-circle feather feather-user-x ${
                  selected.length ? "btn-error" : "btn-disabled opacity-60"
                }`}
                aria-label={t("removeFromLoop")}
                disabled={!selected || !isSelectApproved}
              ></button>
            </div>

            <div className="tooltip" data-tip={t("approveUser")}>
              <button
                type="button"
                onClick={onApprove}
                className={`btn btn-sm btn-circle feather feather-user-check ${
                  selected.length ? "btn-secondary" : "btn-disabled opacity-60"
                }`}
                aria-label={t("approveUser")}
                disabled={!selected || isSelectApproved}
              ></button>
            </div>
          </div>
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
