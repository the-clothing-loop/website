import { useState, useEffect } from "react";
import { CSVLink } from "react-csv";
import { useTranslation } from "react-i18next";
import { useParams, Link, useLocation } from "react-router-dom";

import { Download as DownloadIcon } from "@mui/icons-material";
import { makeStyles } from "@mui/styles";

// Project resources
import theme from "../util/theme";
import { Chain, User } from "../api/types";
import { chainGet, chainGetAll } from "../api/chain";
import { userGetAllByChain } from "../api/user";
import { SizeI18nKeys } from "../api/enums";

interface Params {
  chainUID: string;
}

const chainsHeaders = [
  { label: "Name", key: "name" },
  { label: "Location", key: "address" },
  { label: "Categories", key: "genders" },
  { label: "Sizes", key: "sizes" },
  { label: "Published", key: "published" },
  { label: "Description", key: "description" },
];

const DataExport = () => {
  const { t } = useTranslation();
  const classes = makeStyles(theme as any)();

  const [chains, setChains] = useState<Chain[]>();
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      let chains = (await chainGetAll()).data;
      let sortedChains = chains.sort((a, b) => a.name.localeCompare(b.name));
      setChains(sortedChains);
    })();
  }, []);

  return (
    <div className={classes.buttonExport}>
      <CSVLink
        data={chains ? chains : ""}
        headers={chainsHeaders}
        filename={"Loops-list.csv"}
      >
        {t("exportData")}
        <DownloadIcon />
      </CSVLink>
    </div>
  );
};

const usersHeaders: Array<{ label: string; key: keyof UserData }> = [
  { label: "Name", key: "name" },
  { label: "Address", key: "address" },
  { label: "Email", key: "email" },
  { label: "Phone", key: "phoneNumber" },
  { label: "Interested Sizes", key: "interestedSizes" },
  // { label: "Newsletter", key: "newsletter" },
];

interface UserData {
  name: string;
  address: string;
  email: string;
  phoneNumber: string;
  interestedSizes: string[];
  // newsletter: string;
}

const UserDataExport = () => {
  const { t } = useTranslation();
  const { chainUID } = useParams<Params>();
  const classes = makeStyles(theme as any)();
  const [chain, setChain] = useState<Chain>();
  const [users, setUsers] = useState<UserData[]>();
  const [error, setError] = useState("");

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
          }))
        );
      } catch (error) {
        console.error(error);
      }
    })();
  }, []);

  return (
    <div className={classes.buttonExport}>
      <CSVLink
        data={users ? users : ""}
        headers={usersHeaders}
        filename={`${chain?.name}-participants.csv`}
      >
        {t("exportData")}
        <DownloadIcon />
      </CSVLink>
    </div>
  );
};

export { DataExport, UserDataExport };
