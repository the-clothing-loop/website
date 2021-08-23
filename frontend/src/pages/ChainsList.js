import { useState, useEffect } from "react";
import { useHistory, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Helmet } from "react-helmet";

// Material UI
import Table from "@material-ui/core/Table";
import TableHead from "@material-ui/core/TableHead";
import TableBody from "@material-ui/core/TableBody";
import TableRow from "@material-ui/core/TableRow";
import TableCell from "@material-ui/core/TableCell";
import { Button } from "@material-ui/core";
import TablePagination from "@material-ui/core/TablePagination";
import Chip from "@material-ui/core/Chip";
import Paper from "@material-ui/core/Paper";
import TableContainer from "@material-ui/core/TableContainer";

// Project resources
import { getChains } from "../util/firebase/chain";
import { Typography } from "@material-ui/core";
import { getUsersForChain, getUserById } from "../util/firebase/user";

const rows = ["name", "location", "status", "active users"];

const ChainsList = () => {
  const { t } = useTranslation();
  const history = useHistory();
  const [chains, setChains] = useState();

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const handleChangePage = (e, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (e) => {
    setRowsPerPage(+e.target.value);
    setPage(0);
  };

  useEffect(() => {
    (async () => {
      let chains = await getChains();

      let activeUsers = 0;
      for (const chain of chains) {
        try {
          const getUsersForChainRes = await getUsersForChain(chain.id);
          activeUsers = getUsersForChainRes.length;
          chain.activeUsers = activeUsers;
        } catch (error) {
          console.error("error in getting users for chain with id", chain.id);
        }
      }
      let sortedChains = chains.sort((a, b) => a.name.localeCompare(b.name));
      setChains(sortedChains);
    })();
  }, []);

  return chains ? (
    <>
      <Helmet>
        <title>Clothing-Loop | Loops list</title>
        <meta name="description" content="Chain list" />
      </Helmet>
      <div className="table-container">
        <div className="table-head">
          <Typography variant="h5">{`${chains.length} Clothing Loops`}</Typography>
          <Button variant="outlined" color="primary">
            {"export data"}
          </Button>
        </div>
        <TableContainer component={Paper}>
          <Table aria-label="simple table">
            <TableHead>
              <TableRow className="table-row-head">
                {rows.map((row, i) => {
                  return (
                    <TableCell component="th" key={i}>
                      {row}
                    </TableCell>
                  );
                })}
              </TableRow>
            </TableHead>
            <TableBody>
              {chains
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((chain, i) => (
                  <TableRow key={chain.name}>
                    <TableCell component="th" scope="row">
                      {chain.name}
                    </TableCell>
                    <TableCell key="chain-address" align="left">
                      {chain.address}
                    </TableCell>
                    <TableCell key="chain-status" align="left">
                      {" "}
                      {chain.published ? (
                        <div style={{ display: "flex" }}>
                          <span className="dot-active"></span>
                          <Typography variant="body2">{"published"}</Typography>
                        </div>
                      ) : (
                        <div style={{ display: "flex" }}>
                          <span className="dot-not-active"></span>
                          <Typography variant="body2">
                            {"unpublished"}
                          </Typography>
                        </div>
                      )}
                    </TableCell>
                    <TableCell key="chain-users" align="left">
                      {chain.activeUsers}
                    </TableCell>
                    <TableCell align="left">
                      <Button
                        variant="contained"
                        color="primary"
                        onClick={(e) => {
                          e.preventDefault();
                          history.push(`/chains/members/${chain.id}`);
                        }}
                      >
                        {"view"}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={chains.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onChangePage={handleChangePage}
            onChangeRowsPerPage={handleChangeRowsPerPage}
          />
        </TableContainer>
      </div>
    </>
  ) : null;
};

export default ChainsList;
