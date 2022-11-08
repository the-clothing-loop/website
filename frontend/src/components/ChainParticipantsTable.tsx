import { useState } from "react";

import { makeStyles } from "@mui/styles";

import theme from "../util/theme";
import { UID, User } from "../api/types";
import { SizeI18nKeys } from "../api/enums";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

const useStyles = makeStyles(theme as any);

export interface TableUserColumn {
  headerName: string;
  propertyName: keyof User;
}

interface Props {
  columns: TableUserColumn[];
  authUser: User | null;
  users: User[];
  initialPage: number;
  chainUID: string;
  edit: boolean;
  remove: boolean;
  onRemoveUser?: (uid: UID) => void;
}

export const ChainParticipantsTable = ({
  columns,
  authUser,
  users,
  chainUID,
  edit,
  remove,
  onRemoveUser,
}: Props) => {
  const { t } = useTranslation();

  return (
    <>
      <div className="sm:tw-overflow-x-auto tw-mt-10">
        <table className="tw-table tw-w-full">
          <thead>
            <tr>
              {columns.map(({ headerName }) => {
                return <th key={headerName}>{headerName}</th>;
              })}

              {authUser?.is_root_admin && (
                <>
                  {edit && <th />}
                  {remove && <th />}
                </>
              )}
            </tr>
          </thead>
          <tbody>
            {users
              .sort((a, b) => a.name.localeCompare(b.name))
              .map((u: User) => (
                <tr key={u.uid}>
                  {columns.map(({ propertyName }) => {
                    let text: User[keyof User] | JSX.Element[] =
                      u[propertyName];
                    if (propertyName === "sizes") {
                      text = u.sizes
                        .filter((v) => Object.hasOwn(SizeI18nKeys, v))
                        .map((v) => (
                          <span className="tw-badge tw-badge-outline tw-mr-2">
                            {t(SizeI18nKeys[v])}
                          </span>
                        ));
                    } else if (typeof text !== "string") {
                      console.error(
                        "text is not of type string, this should not be happening",
                        text
                      );
                      text = "" + text;
                    }
                    return (
                      <td className="tw-border-none" key={u.uid + propertyName}>
                        {text}
                      </td>
                    );
                  })}

                  {authUser?.is_root_admin && (
                    <>
                      {edit && (
                        <td className="tw-border-none" key={u.uid + "editlink"}>
                          <Link
                            to={{
                              pathname: `/users/${u.uid}/edit`,
                              state: {
                                chainUID,
                              },
                            }}
                          >
                            <span className="feather feather-edit-2" />
                          </Link>
                        </td>
                      )}
                      {remove && onRemoveUser && (
                        <td className="tw-border-none" key={u.uid + "dellink"}>
                          <span
                            className="feather feather-x"
                            onClick={() => onRemoveUser(u.uid as string)}
                          />
                        </td>
                      )}
                    </>
                  )}
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </>
  );
};
