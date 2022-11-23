import { useState, useEffect } from "react";
import { CSVLink } from "react-csv";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";

import { Chain } from "../api/types";
import { chainGet, chainGetAll } from "../api/chain";
import { userGetAllByChain } from "../api/user";
import { GenderI18nKeys, SizeI18nKeys } from "../api/enums";

interface Params {
  chainUID: string;
}

const chainsHeaders: Array<{ label: string; key: keyof ChainData }> = [
  { label: "Name", key: "name" },
  { label: "Location", key: "address" },
  { label: "Categories", key: "genders" },
  { label: "Sizes", key: "sizes" },
  { label: "Published", key: "published" },
  { label: "Description", key: "description" },
];

interface ChainData {
  name: string;
  address: string;
  genders: string[];
  sizes: string[];
  published: boolean;
  description: string;
}

const DataExport = (props: { chains: Chain[] }) => {
  const { t } = useTranslation();

  const [chains, setChains] = useState<ChainData[]>();

  useEffect(() => {
    (async () => {
      setChains(
        props.chains.map((c) => ({
          name: c.name,
          address: c.address,
          genders: c.genders?.map((g) => GenderI18nKeys[g]) || [],
          sizes: c.sizes?.map((s) => SizeI18nKeys[s]) || [],
          published: c.published,
          description: c.description,
        }))
      );
    })();
  }, []);

  return (
    <CSVLink
      data={chains ? chains : ""}
      headers={chainsHeaders}
      filename={"Loops-list.csv"}
      className="btn btn-primary btn-outline"
    >
      {t("exportData")}
      <span className="feather feather-download ml-3" />
    </CSVLink>
  );
};

const usersHeaders: Array<{ label: string; key: keyof UserData }> = [
  { label: "Name", key: "name" },
  { label: "Address", key: "address" },
  { label: "Email", key: "email" },
  { label: "Phone", key: "phoneNumber" },
  { label: "Interested Sizes", key: "interestedSizes" },
  { label: "Newsletter", key: "newsletter" },
];

interface UserData {
  name: string;
  address: string;
  email: string;
  phoneNumber: string;
  interestedSizes: string[];
  newsletter: boolean;
}

const UserDataExport = () => {
  const { t } = useTranslation();
  const { chainUID } = useParams<Params>();
  const [chain, setChain] = useState<Chain>();
  const [users, setUsers] = useState<UserData[]>();

  useEffect(() => {
    (async () => {
      try {
        const chainData = (await chainGet(chainUID)).data;
        setChain(chainData);
        const chainUsers = (await userGetAllByChain(chainUID)).data;
        setUsers(
          chainUsers.map((u) => ({
            name: u.name,
            address: u.address,
            email: u.email,
            phoneNumber: u.phone_number,
            interestedSizes: u.sizes.map((s) => SizeI18nKeys[s]),
            newsletter: false,
          }))
        );
      } catch (error) {
        console.error(error);
      }
    })();
  }, []);

  return (
    <CSVLink
      data={users ? users : ""}
      headers={usersHeaders}
      filename={`${chain?.name}-participants.csv`}
      className="btn btn-primary btn-outline"
    >
      {t("exportData")}
      <span className="feather feather-download ml-3" />
    </CSVLink>
  );
};

export { DataExport, UserDataExport };
