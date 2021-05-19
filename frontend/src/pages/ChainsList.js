import { useState, useEffect } from "react";
import { useParams, Link, useHistory } from "react-router-dom";
import { useTranslation } from "react-i18next";

// Material UI
import KeyboardArrowRightIcon from "@material-ui/icons/KeyboardArrowRight";
import Table from "@material-ui/core/Table";
import TableHead from "@material-ui/core/TableHead";
import TableBody from "@material-ui/core/TableBody";
import TableRow from "@material-ui/core/TableRow";
import TableCell from "@material-ui/core/TableCell";

// Project resources
import { getChains } from "../util/firebase/chain";
import { Typography } from "@material-ui/core";

const ChainsList = () => {
  const { t } = useTranslation();
  const [chains, setChains] = useState();
  const [sortedChains, setSortedChains] = useState();

  //TODO get host details and render infos

  useEffect(() => {
    getChains().then((response) => setChains(response));
  }, []);

  const sortArray = () => {
    if (chains == null) {
      return chains;
    } else {
      let sortedArray = chains.sort((a, b) => a.name.localeCompare(b.name));
      setSortedChains(sortedArray);
      return sortedArray;
    }
  };

  useEffect(() => {
    sortArray();
  }, [chains]);

  return chains ? (
    <Table>
      <TableHead>
        {" "}
        <Typography variant="h3" component="h2">
          All Chains{" "}
        </Typography>
        <TableRow>
          <TableCell>{"chain name"}</TableCell>
          <TableCell>{"active users"}</TableCell>
          <TableCell>{"host name"}</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {chains.map((chain) => (
          <TableRow key={chain.id}>
            <TableCell>{chain.name}</TableCell>
            <TableCell>{"active users"}</TableCell>
            <TableCell>{"host name"}</TableCell>
            <TableCell align="right">
              <Link to={`/chains/${chain.id}/information`}>
                <KeyboardArrowRightIcon />
              </Link>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  ) : null;
};

export default ChainsList;
