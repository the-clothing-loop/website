import {
  useState,
  useEffect,
  useContext,
  ChangeEvent,
  useMemo,
  FormEvent,
  useRef,
} from "react";
import { useParams, Link, useHistory, Redirect } from "react-router-dom";
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

  const isChainAdmin = useMemo(
    () =>
      authUser?.chains.find((c) => c.chain_uid == chain?.uid)?.is_chain_admin ||
      false,
    [authUser, chain]
  );

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
    const chainUsers = (await userGetAllByChain(chain!.uid)).data;
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
        <div className="tw-flex tw-flex-col md:tw-flex-row tw-container tw-mx-auto tw-pt-4">
          <section className="tw-w-1/3">
            <div className="tw-relative tw-bg-teal-light tw-p-8">
              <Link
                className="tw-absolute tw-top-6 tw-right-8 tw-btn tw-btn-ghost tw-btn-circle"
                to={`/loops/${chainUID}/edit`}
              >
                <span className="feather feather-edit-2" />
              </Link>

              <h1 className="tw-font-serif tw-font-bold tw-text-secondary tw-mb-6 tw-text-4xl">
                {chain.name}
              </h1>
              <p className="tw-text-lg tw-mb-6">{chain.description}</p>

              <dl>
                <dt className="tw-font-bold tw-mb-1">{t("categories")}</dt>
                <dd className="tw-mb-2">
                  {chain?.genders && GenderBadges(t, chain.genders)}
                </dd>
                <dt className="tw-font-bold tw-mb-1">{t("sizes")}</dt>
                <dd className="tw-mb-2">
                  {chain?.sizes && SizeBadges(t, chain.sizes)}
                </dd>
                <dt className="tw-font-bold tw-mb-2">{t("participants")}</dt>
                <dd className="tw-text-sm tw-mb-1">
                  {users.length.toString()}{" "}
                  {t("peopleWithCount", { count: users.length })}
                </dd>
              </dl>

              <div className="tw-flex tw-flex-col">
                <div className="tw-form-control tw-w-full">
                  <label className="tw-cursor-pointer tw-label tw-px-0">
                    <span className="tw-label-text">
                      {published ? t("published") : t("draft")}
                    </span>
                    <input
                      type="checkbox"
                      className={`tw-toggle tw-toggle-secondary ${
                        error === "published" ? "tw-border-error" : ""
                      }`}
                      name="published"
                      checked={published}
                      onChange={handleChangePublished}
                    />
                  </label>
                </div>
                <div className="tw-form-control tw-w-full">
                  <label className="tw-cursor-pointer tw-label tw-px-0 -tw-mb-2">
                    <span className="tw-label-text">
                      {openToNewMembers ? t("openToNewMembers") : t("closed")}
                    </span>
                    <input
                      type="checkbox"
                      className={`tw-toggle tw-toggle-secondary ${
                        error === "openToNewMembers" ? "tw-border-error" : ""
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
            isChainAdmin={isChainAdmin}
            refresh={refresh}
          />
        </div>

        <div className="tw-container tw-mx-auto">
          <h2 className="tw-font-serif tw-font-bold tw-text-secondary tw-text-4xl tw-mb-6">
            Loop Participants
          </h2>
          <UserDataExport />

          <ParticipantsTable
            authUser={authUser}
            users={users}
            chain={chain}
            isChainAdmin={isChainAdmin}
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
  isChainAdmin: boolean;
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
    <section className="tw-w-2/3 tw-relative tw-p-8 tw-bg-secondary-light">
      <Link
        className="tw-absolute tw-top-6 tw-right-8  tw-btn tw-btn-ghost tw-btn-circle"
        to={{
          pathname: `/users/${props.authUser?.uid}/edit`,
          state: {
            chainUID: props.chain.uid,
          },
        }}
      >
        <span className="feather feather-edit-2" />
      </Link>
      <h2 className="tw-font-serif tw-font-bold tw-text-secondary tw-mb-6 tw-text-4xl">
        Loop Admin
      </h2>

      <table className="tw-table tw-w-full">
        <thead>
          <tr>
            {props.isChainAdmin ||
              (props.authUser?.is_root_admin && (
                <th className="tw-sticky"></th>
              ))}
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
                {props.isChainAdmin ||
                  (props.authUser?.is_root_admin && (
                    <td className="tw-sticky">
                      <input
                        type="checkbox"
                        name="selectedChainAdmin"
                        className="tw-checkbox tw-checkbox-sm tw-checkbox-primary"
                        checked={selected === u.uid}
                        onChange={onChangeSelect}
                        value={u.uid}
                      />
                    </td>
                  ))}
                <td>{u.name}</td>
                <td>{u.email}</td>
                <td>{u.phone_number}</td>
              </tr>
            ))}
        </tbody>
      </table>
      <div className="tw-rounded-b-lg tw-flex tw-justify-between tw-bg-base-200">
        <div className="tw-flex tw-items-center tw-m-3 tw-bg-base-100 tw-rounded-lg tw-p-2">
          <p className={`tw-mx-2 ${selected ? "" : "tw-text-base-300"}`}>
            {t("selected")}
          </p>
          <div className="tw-tooltip tw-tooltip-bottom" data-tip="edit">
            <Link
              className={`tw-btn tw-btn-sm tw-btn-circle tw-mr-2 feather feather-edit ${
                selected.length
                  ? "tw-btn-primary"
                  : "tw-btn-disabled tw-opacity-60"
              }`}
              aria-label="edit"
              aria-disabled={!selected}
              to={editHost}
            ></Link>
          </div>
          <div className="tw-tooltip tw-tooltip-bottom" data-tip="demote">
            <button
              type="button"
              onClick={onDemote}
              className={`tw-btn tw-btn-sm tw-btn-circle feather feather-shield-off ${
                selected.length
                  ? "tw-btn-error"
                  : "tw-btn-disabled tw-opacity-60"
              }`}
              aria-label="demote"
              disabled={!selected}
            ></button>
          </div>
        </div>
        <form className="tw-flex tw-p-3 tw-items-end" onSubmit={onAddCoHost}>
          <select
            className="tw-select tw-select-sm tw-rounded-l-lg"
            name="participant"
            ref={refSelect}
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
            className="tw-btn tw-btn-primary tw-btn-sm tw-rounded-r-lg"
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
  isChainAdmin: boolean;
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
      <div className="tw-mt-10">
        <table className="tw-table tw-table-compact tw-w-full">
          <thead>
            <tr>
              <th className="tw-sticky"></th>
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
                  <td className="tw-sticky">
                    <input
                      type="checkbox"
                      name="selectedChainAdmin"
                      className="tw-checkbox tw-checkbox-sm tw-checkbox-primary"
                      checked={selected.includes(u.uid)}
                      onChange={onChangeSelect}
                      value={u.uid}
                    />
                  </td>
                  <td>{u.name}</td>
                  <td>
                    <span className="tw-block tw-w-48 tw-text-sm tw-whitespace-normal">
                      {u.address}
                    </span>
                  </td>
                  <td className="tw-text-sm tw-leading-relaxed">
                    {u.email}
                    <br />
                    {u.phone_number}
                  </td>
                  <td className="tw-p-0">
                    <div className="tw-w-48 tw-h-10 tw-overflow-hidden hover:tw-overflow-visible focus-within:tw-overflow-visible">
                      <span
                        className="tw-block tw-w-48 tw-px-2 tw-pt-2 tw-bg-base-100 tw-rounded-lg tw-whitespace-normal [&_span]:tw-mb-2"
                        tabIndex={0}
                      >
                        {SizeBadges(t, u.sizes)}
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
        <div className="tw-rounded-b-lg tw-flex tw-justify-between tw-bg-base-200">
          <div className="tw-flex tw-m-3 tw-bg-base-100 tw-rounded-lg tw-p-2">
            <p className="tw-block tw-mx-2">
              <span className="tw-text-2xl tw-font-bold tw-mr-2">
                {selected.length}
              </span>
              {t("selected")}
            </p>
            <div className="tw-tooltip tw-tooltip-bottom" data-tip="edit">
              <Link
                className={`tw-btn tw-btn-sm tw-btn-circle tw-mr-2 feather feather-edit ${
                  selected.length === 1
                    ? "tw-btn-primary"
                    : "tw-btn-disabled tw-opacity-60"
                }`}
                aria-label="edit"
                aria-disabled={!selected}
                to={edit}
              ></Link>
            </div>
            <div className="tw-tooltip tw-tooltip-bottom" data-tip="remove">
              <button
                type="button"
                onClick={onRemove}
                className={`tw-btn tw-btn-sm tw-btn-circle feather feather-user-x ${
                  selected.length
                    ? "tw-btn-error"
                    : "tw-btn-disabled tw-opacity-60"
                }`}
                aria-label="remove"
                disabled={!selected}
              ></button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
