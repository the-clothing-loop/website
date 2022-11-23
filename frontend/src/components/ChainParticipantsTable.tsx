import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { UID, User } from "../api/types";
import { SizeBadges } from "./Badges";

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

export default function ChainParticipantsTable({
  columns,
  authUser,
  users,
  chainUID,
  edit,
  remove,
  onRemoveUser,
}: Props) {
  const { t } = useTranslation();

  return (
    <>
      <div className="overflow-x-auto mt-10">
        <table className="table w-full">
          <thead>
            <tr>
              {columns.map(({ headerName }) => {
                return <th key={headerName}>{headerName}</th>;
              })}

              {authUser?.is_root_admin && (
                <>
                  {edit && <th key="edit" />}
                  {remove && <th key="remove" />}
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
                      text = SizeBadges(t, u.sizes);
                    } else if (typeof text !== "string") {
                      console.error(
                        "text is not of type string, this should not be happening",
                        text
                      );
                      text = "" + text;
                    }
                    return (
                      <td className="border-none" key={u.uid + propertyName}>
                        {text}
                      </td>
                    );
                  })}

                  {authUser?.is_root_admin && (
                    <>
                      {edit && (
                        <td className="border-none" key={u.uid + "editlink"}>
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
                        <td className="border-none" key={u.uid + "dellink"}>
                          <button
                            className="feather feather-x"
                            aria-label=""
                            onClick={() => onRemoveUser(u.uid as string)}
                          ></button>
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
}
