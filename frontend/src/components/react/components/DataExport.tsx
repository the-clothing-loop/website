import { getPausedDate } from "../util/pausedMembers";
import { useMemo } from "react";
import { CSVLink } from "react-csv";

import type { UID, User } from "../../../api/types";
import { Sizes } from "../../../api/enums";
import { useTranslation } from "react-i18next";

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
  C: "maternity",
  D: "teenGirls",
  E: "teenBoys",
};

const usersHeaders: Array<{ label: string; key: keyof UserData }> = [
  { label: "Paused since", key: "pausedSince" },
  { label: "Name", key: "name" },
  { label: "Address", key: "address" },
  { label: "Email", key: "email" },
  { label: "Phone", key: "phoneNumber" },
  { label: "Interested Sizes", key: "interestedSizes" },
];

interface UserData {
  pausedSince: string;
  name: string;
  address: string;
  email: string;
  phoneNumber: string;
  interestedSizes: string;
}

export function UserDataExport(props: {
  chainName: string;
  chainUID: UID;
  chainUsers: User[];
  route?: UID[];
}) {
  const { t } = useTranslation();

  const data = useMemo(() => {
    const users = props.route
      ? props.route
          .map((r) => props.chainUsers.find((u) => u.uid === r))
          .filter((u): u is User => !!u)
      : props.chainUsers;
    return users.map<UserData>((u) => ({
      pausedSince: getPausedDate(u, props.chainUID),
      name: u.name,
      address: u.address,
      email: u.email!,
      phoneNumber: u.phone_number,
      interestedSizes: u.sizes.map((s) => SizeNames[s]).join(","),
    }));
  }, [props.chainUsers, props.route, props.chainUID]);

  return (
    <CSVLink
      separator=";"
      data={data ? data : ""}
      headers={usersHeaders}
      filename={`${props.chainName}-participants.csv`}
      className="btn btn-secondary btn-outline tooltip md:tooltip-left rtl:md:tooltip-right flex"
      data-tip={t("exportToSpreadsheet")}
    >
      {t("exportData")}
      <span className="icon-download ms-3" />
    </CSVLink>
  );
}
