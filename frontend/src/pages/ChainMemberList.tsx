import {
  useState,
  useEffect,
  useContext,
  ChangeEvent,
  useMemo,
  FormEvent,
  useRef,
} from "react";
import { useParams, Link, useHistory } from "react-router-dom";
import type { LocationDescriptor } from "history";
import { Helmet } from "react-helmet";
import { useTranslation } from "react-i18next";

import { AuthContext, AuthProps } from "../providers/AuthProvider";
import { UserDataExport } from "../components/DataExport";
import {
  chainAddUser,
  chainGet,
  chainRemoveUser,
  chainUpdate,
} from "../api/chain";
import { Chain, User } from "../api/types";
import { userGetAllByChain } from "../api/user";
import { ToastContext } from "../providers/ToastProvider";
import { GenderBadges, SizeBadges } from "../components/Badges";
import FormJup from "../util/form-jup";

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
    } catch (e: any) {
      console.error("Error updating chain: ", e);
      setError(e?.data || `Error: ${JSON.stringify(e)}`);
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
        openToNewMembers: isChecked,
      });
    } catch (e: any) {
      console.error(`Error updating chain: ${JSON.stringify(e)}`);
      setError(e?.data || `Error: ${JSON.stringify(e)}`);
      setOpenToNewMembers(oldValue);
    }
  }

  useEffect(() => {
    (async () => {
      try {
        const chainData = (await chainGet(chainUID)).data;
        setChain(chainData);
        const chainUsers = (await userGetAllByChain(chainUID)).data;
        setUsers(chainUsers);
        setPublished(chainData.published);
        setOpenToNewMembers(chainData.openToNewMembers);
      } catch (error: any) {
        console.error(`Error getting chain: ${error}`);
      }
    })();
  }, [history]);

  async function refresh() {
    const chainUsers = (await userGetAllByChain(chainUID)).data;
    setUsers(chainUsers);
  }

  if (!chain || !users) {
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
                className="absolute top-6 right-8 btn btn-ghost btn-circle"
                to={`/loops/${chainUID}/edit`}
              >
                <span className="feather feather-edit-2" />
              </Link>

              <h1 className="font-serif font-bold text-secondary mb-6 text-4xl">
                {chain.name}
              </h1>
              <p className="text-lg mb-6">{chain.description}</p>

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
                  {users.length.toString()}{" "}
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
          <UserDataExport />

          <ParticipantsTable
            authUser={authUser}
            users={users}
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
  const { addToastError } = useContext(ToastContext);

  const refSelect: any = useRef<HTMLSelectElement>();
  const [selected, setSelected] = useState("");

  const [filteredUsersHost, filteredUsersNotHost] = useMemo(() => {
    let host: User[] = [];
    let notHost: User[] = [];
    props.users?.forEach((u) => {
      let uc = u.chains.find((c) => c.chain_uid === props.chain?.uid);
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
      addToastError("Edit button coundn't find user of: " + selected);
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
    let chainUID = props.chain.uid;

    chainAddUser(chainUID, selected, false).finally(() => {
      setSelected("");
      return props.refresh();
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
    <section className="lg:w-2/3 relative p-8 pt-0 bg-secondary-light">
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
      <div className="rounded-b-lg w-full flex justify-between bg-base-200">
        <div className="flex items-center m-3 bg-base-100 rounded-lg p-2">
          <p className={`mx-2 ${selected ? "" : "text-base-300"}`}>
            {t("selected")}
          </p>
          <div className="tooltip tooltip-bottom" data-tip={t("edit")}>
            <Link
              className={`btn btn-sm btn-circle mr-2 feather feather-edit ${
                selected.length ? "btn-primary" : "btn-disabled opacity-60"
              }`}
              aria-label={t("edit")}
              aria-disabled={!selected}
              to={editHost}
            ></Link>
          </div>
          <div
            className="tooltip tooltip-bottom"
            data-tip={t("setAsAParticipant")}
          >
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
        <form className="flex p-3 items-end" onSubmit={onAddCoHost}>
          <select
            className="select select-sm rounded-l-lg disabled:text-base-300"
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
            className={`btn btn-sm rounded-r-lg ${
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
  chain: Chain;
  refresh: () => Promise<void>;
}) {
  const { t } = useTranslation();
  const { addToastError, addToast } = useContext(ToastContext);

  const [selected, setSelected] = useState<string[]>([]);

  const edit = useMemo<LocationDescriptor<{ chainUID: string }>>(() => {
    if (selected.length !== 1) {
      return "#";
    }
    let userUID = props.users?.find((u) => u.uid === selected[0])?.uid;
    if (!userUID) {
      addToastError("Edit button coundn't find user of: " + selected);
    }

    return {
      pathname: `/users/${userUID}/edit`,
      state: {
        chainUID: props.chain.uid,
      },
    };
  }, [selected, props.users, props.chain]);

  function onChangeSelect(e: ChangeEvent<HTMLInputElement>) {
    let value = e.target.value;
    if (e.target.checked) setSelected([...selected, value]);
    else setSelected(selected.filter((s) => s !== value));
  }

  function onRemove() {
    let chainUID = props.chain.uid;
    Promise.all(selected.map((s) => chainRemoveUser(chainUID, s))).finally(
      () => {
        setSelected([]);
        return props.refresh();
      }
    );
  }

  return (
    <>
      <div className="mt-10 relative">
        <div className="overflow-x-auto">
          <table className="table table-compact w-full">
            <thead>
              <tr>
                <th className="sticky z-0"></th>
                <th>{t("name")}</th>
                <th>{t("address")}</th>
                <th>{t("contact")}</th>
                <th>{t("interested size")}</th>
              </tr>
            </thead>
            <tbody>
              {props.users
                .sort((a, b) => a.name.localeCompare(b.name))
                .map((u: User) => (
                  <tr key={u.uid}>
                    <td className="sticky">
                      <input
                        type="checkbox"
                        name="selectedChainAdmin"
                        className="checkbox checkbox-sm checkbox-primary"
                        checked={selected.includes(u.uid)}
                        onChange={onChangeSelect}
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
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
        <div className="rounded-b-lg flex justify-between bg-base-200 sticky z-10 bottom-0">
          <div className="flex m-3 bg-base-100 rounded-lg p-2">
            <p className="block mx-2">
              <span className="text-2xl font-bold mr-2">{selected.length}</span>
              {t("selected")}
            </p>
            <div className="tooltip tooltip-bottom" data-tip={t("edit")}>
              <Link
                className={`btn btn-sm btn-circle mr-2 feather feather-edit ${
                  selected.length === 1
                    ? "btn-primary"
                    : "btn-disabled opacity-60"
                }`}
                aria-label={t("edit")}
                aria-disabled={!selected}
                to={edit}
              ></Link>
            </div>
            <div
              className="tooltip tooltip-bottom"
              data-tip={t("removeFromLoop")}
            >
              <button
                type="button"
                onClick={onRemove}
                className={`btn btn-sm btn-circle feather feather-user-x ${
                  selected.length ? "btn-error" : "btn-disabled opacity-60"
                }`}
                aria-label={t("removeFromLoop")}
                disabled={!selected}
              ></button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
