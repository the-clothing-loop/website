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
import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";
import Typography from "@material-ui/core/Typography";

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
    (async () => {
      try {
        const chainData = await getChain(chainId);
        setChain(chainData);
        const users = await getUsersForChain(chainId);
        setUsers(users);
      } catch (error) {
        console.error(error);
      }
    })();
  }, []);

  console.log(chain);
  return !chain || !users ? null : (
    <div className="chain-member-list">
      <Card>
        <CardContent>
          <Typography variant="h3" component="h2">
            {chain.name}
          </Typography>
          <Typography
            variant="body2"
            component="p"
            style={{ display: "inline" }}
          >
            {chain.description}
          </Typography>{" "}
          {" | "}
          <Typography
            variant="body2"
            component="p"
            style={{ display: "inline" }}
          >
            {chain.address}
          </Typography>
          <Link to={`/chains/${chainId}/edit`}>
            <EditIcon />
          </Link>
          {location.state ? (
            <p className="success">{location.state.message}</p>
          ) : null}
        </CardContent>
      </Card>
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
