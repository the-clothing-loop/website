import { useState, useEffect, useMemo } from "react";
import { CSVLink } from "react-csv";
import { useTranslation } from "react-i18next";

import { Chain, User } from "../api/types";
import { GenderI18nKeys, Sizes } from "../api/enums";

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
  genders: string;
  sizes: string;
  published: boolean;
  description: string;
}

export const SizeNames: Record<Sizes | string, string> = {
  "1": "baby",
  "2": "1_to_4",
  "3": "5_to_12",
  "4": "women_s",
  "5": "women_m",
  "6": "women_l",
  "7": "women_plus",
  "8": "men_s",
  "9": "men_m",
  A: "men_l",
  B: "men_plus",
};

function DataExport(props: { chains: Chain[] }) {
  const { t } = useTranslation();

  const [data, setData] = useState<ChainData[]>();

  useEffect(() => {
    (async () => {
      setData(
        props.chains.map((c) => ({
          name: c.name,
          address: c.address,
          genders: (c.genders?.map((g) => GenderI18nKeys[g]) || []).join(","),
          sizes: (c.sizes?.map((s) => SizeNames[s]) || []).join(","),
          published: c.published,
          description: c.description,
        }))
      );
    })();
  }, []);

  return (
    <CSVLink
      separator=";"
      data={data ? data : ""}
      headers={chainsHeaders}
      filename={"Loops-list.csv"}
      className="btn btn-secondary btn-outline"
    >
      {t("exportData")}
      <span className="feather feather-download ml-3" />
    </CSVLink>
  );
}

const usersHeaders: Array<{ label: string; key: keyof UserData }> = [
  { label: "Name", key: "name" },
  { label: "Address", key: "address" },
  { label: "Email", key: "email" },
  { label: "Phone", key: "phoneNumber" },
  { label: "Interested Sizes", key: "interestedSizes" },
];

interface UserData {
  name: string;
  address: string;
  email: string;
  phoneNumber: string;
  interestedSizes: string;
}

function UserDataExport(props: { chainName: string; chainUsers?: User[] }) {
  const { t } = useTranslation();

  const data = useMemo(() => {
    return props.chainUsers?.map<UserData>((u) => ({
      name: u.name,
      address: u.address,
      email: u.email,
      phoneNumber: u.phone_number,
      interestedSizes: u.sizes.map((s) => SizeNames[s]).join(","),
    }));
  }, [props.chainUsers]);

  return (
    <CSVLink
      separator=";"
      data={data ? data : ""}
      headers={usersHeaders}
      filename={`${props.chainName}-participants.csv`}
      className="btn btn-secondary btn-outline"
    >
      {t("exportData")}
      <span className="feather feather-download ml-3" />
    </CSVLink>
  );
}

export { DataExport, UserDataExport };
