import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Helmet } from "react-helmet";


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

  //TODO get host details and render infos
  useEffect(() => {
    (async () => {
      let chains = await getChains();
      let sortedChains = chains.sort((a, b) => a.name.localeCompare(b.name));
      setChains(sortedChains);
    })();
  }, []);

  return chains ? (
    <>
      <Helmet>
        <title>Clothing-chain | Chain list</title>
        <meta name="description" content="Chain list" />
      </Helmet>
      <div>
        <Typography variant="h3" component="h2" align="center">
          All Chains
        </Typography>
        <Table>
          <TableHead>
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
                  <Link to={`/chains/members/${chain.id}`}>
                    <KeyboardArrowRightIcon />
                  </Link>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </>
  ) : null;
};

export default ChainsList;
