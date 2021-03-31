import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useTranslation } from 'react-i18next';

// Material UI
import Table from '@material-ui/core/Table';
import TableHead from '@material-ui/core/TableHead';
import TableBody from '@material-ui/core/TableBody';
import TableRow from '@material-ui/core/TableRow';
import TableCell from '@material-ui/core/TableCell';

// Project resources
import { getChain } from "../../util/firebase/chain";
import { getUsersForChain } from "../../util/firebase/user";
import { IChain, IUser } from "../../types";

type TParams = {
  chainId: string;
}

const ChainMemberList = () => {
  const { t } = useTranslation();
  const { chainId } = useParams<TParams>();
  const [chain, setChain] = useState<IChain>();
  const [users, setUsers] = useState<IUser[]>();

  useEffect(() => {
    (async function() {
      try {
        const { chain, chainReference } = await getChain(chainId);
        setChain(chain);
        const users = await getUsersForChain(chainReference);
        setUsers(users);
      } catch(error) {
        console.error(error);
      }
    })();
  });

  return (!chain || !users) ? null : (
    <>
      <h1>{chain.name}</h1>
      <h2>{t("members")}</h2>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>{t("name")}</TableCell>
            <TableCell>{t("address")}</TableCell>
            <TableCell>{t("phonenumber")}</TableCell>
            <TableCell>{t("email")}</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {users.map((u: IUser) => (
            <TableRow key={u.id}>
              <TableCell>{u.name}</TableCell>
              <TableCell>{u.address}</TableCell>
              <TableCell>{u.phoneNumber}</TableCell>
              <TableCell>{u.email}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </>
  )
}

export default ChainMemberList;
