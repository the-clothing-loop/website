import { useState, useEffect } from "react";
import { useParams, Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";

// Material UI
import Table from "@material-ui/core/Table";
import TableHead from "@material-ui/core/TableHead";
import TableBody from "@material-ui/core/TableBody";
import TableRow from "@material-ui/core/TableRow";
import TableCell from "@material-ui/core/TableCell";
import EditIcon from "@material-ui/icons/Edit";

// Project resources
import { getChain } from "../util/firebase/chain";
import { getUsersForChain } from "../util/firebase/user";
import { IChain, IUser } from "../types";

type TParams = {
  chainId: string;
};

const ChainMemberList = () => {
  const { t } = useTranslation();
  const location = useLocation<any>();
  const { chainId } = useParams<TParams>();
  const [chain, setChain] = useState<IChain>();
  const [users, setUsers] = useState<IUser[]>();

  useEffect(() => {
    (async function () {
      try {
        const chainData  = await getChain(chainId);
        setChain(chainData);
        const users = await getUsersForChain(chainId);
        setUsers(users);
      } catch (error) {
        console.error(error);
      }
    })();
  }, []);

  return !chain || !users ? null : (
    <div className="chain-member-list">
      <h1>{chain.name}</h1>
      {location.state ? (
        <p className="success">{location.state.message}</p>
      ) : null}
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>{t("name")}</TableCell>
            <TableCell>{t("address")}</TableCell>
            <TableCell>{t("phoneNumber")}</TableCell>
            <TableCell>{t("email")}</TableCell>
            <TableCell />
          </TableRow>
        </TableHead>
        <TableBody>
          {users.map((u: IUser) => (
            <TableRow key={u.id}>
              <TableCell>{u.name}</TableCell>
              <TableCell>{u.address}</TableCell>
              <TableCell>{u.phoneNumber}</TableCell>
              <TableCell>{u.email}</TableCell>
              <TableCell align="right">
                <Link to={`/users/${u.id}/edit`}>
                  <EditIcon />
                </Link>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default ChainMemberList;
