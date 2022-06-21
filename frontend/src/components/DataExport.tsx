import { useState, useEffect } from "react";
import { CSVLink } from "react-csv";
import { useTranslation } from "react-i18next";
import { useParams, Link, useLocation } from "react-router-dom";

import { Download as DownloadIcon } from "@mui/icons-material";
import { makeStyles } from "@mui/styles";

// Project resources
import { getChain, getChains } from "../util/firebase/chain";
import { getUsersForChain } from "../util/firebase/user";
import theme from "../util/theme";
import { IChain, IUser } from "../types";

const chainsHeaders = [
  { label: "Name", key: "name" },
  { label: "Location", key: "address" },
  { label: "Categories", key: "categories.gender" },
  { label: "Sizes", key: "categories.size" },
  { label: "Published", key: "published" },
  { label: "Open to new members", key: "openToNewMembers" },
  { label: "Description", key: "description" },
];

type TParams = {
  chainId: string;
};

const DataExport = () => {
  const { t } = useTranslation();
  const classes = makeStyles(theme as any)();

  const [chains, setChains] = useState<IChain[]>();
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      let chains = await getChains();
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

const usersHeaders = [
  { label: "Name", key: "name" },
  { label: "Address", key: "address" },
  { label: "Email", key: "email" },
  { label: "Phone", key: "phoneNumber" },
  { label: "Interested Sizes", key: "interestedSizes" },
  { label: "Newsletter", key: "newsletter" },
];

const UserDataExport = () => {
  const { t } = useTranslation();
  const { chainId } = useParams<TParams>();
  const classes = makeStyles(theme as any)();
  const [chain, setChain] = useState<IChain>();
  const [users, setUsers] = useState<IUser[]>();
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const chainData = await getChain(chainId);
        setChain(chainData);
        const chainUsers = await getUsersForChain(chainId);
        setUsers(chainUsers);
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
