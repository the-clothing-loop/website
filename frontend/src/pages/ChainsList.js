import { useState, useEffect } from "react";
import { useHistory } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Helmet } from "react-helmet";

// Material UI
import { makeStyles } from "@material-ui/core";
import Table from "@material-ui/core/Table";
import TableHead from "@material-ui/core/TableHead";
import TableBody from "@material-ui/core/TableBody";
import TableRow from "@material-ui/core/TableRow";
import TableCell from "@material-ui/core/TableCell";
import { Button } from "@material-ui/core";
import TablePagination from "@material-ui/core/TablePagination";
import Paper from "@material-ui/core/Paper";
import TableContainer from "@material-ui/core/TableContainer";
import Alert from "@material-ui/lab/Alert";
import CircularProgress from "@mui/material/CircularProgress";
import Box from "@mui/material/Box";

//media
import RightArrow from "../images/right-arrow-white.svg";

// Project resources
import { getChains } from "../util/firebase/chain";
import { Typography } from "@material-ui/core";
import theme from "../util/theme";

const rows = ["name", "location", "status"];

const ChainsList = () => {
  const { t } = useTranslation();
  const classes = makeStyles(theme)();
  const history = useHistory();
  const [chains, setChains] = useState();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [error, setError] = useState("");

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
      let sortedChains = chains.sort((a, b) => a.name.localeCompare(b.name));
      setChains(sortedChains);
    })();
  }, []);

  return (
    <>
      <Helmet>
        <title>Clothing-Loop | Loops List</title>
        <meta name="description" content="Loops List" />
      </Helmet>
      <div>
        {chains ? (
          <div className="table-container">
            <div className="table-head">
              <Typography variant="h5">{`${chains.length} Clothing Loops`}</Typography>
            </div>
            {error ? (
              <Alert className={classes.errorAlert} severity="error">
                {error}
              </Alert>
            ) : null}

            <TableContainer component={Paper}>
              <Table aria-label="simple table">
                <TableHead>
                  <TableRow className="table-row-head">
                    {rows.map((row, i) => {
                      return (
                        <TableCell
                          component="th"
                          key={i}
                          className={classes.tableCellRoot}
                        >
                          {t(row)}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {chains
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((chain, i) => (
                      <TableRow
                        key={chain.name}
                        className="chains-list__table-row"
                      >
                        <TableCell
                          component="th"
                          scope="row"
                          className={classes.tableCell}
                        >
                          {chain.name}
                        </TableCell>
                        <TableCell
                          key="chain-address"
                          align="left"
                          className={classes.tableCell}
                        >
                          {chain.address}
                        </TableCell>
                        <TableCell
                          key="chain-status"
                          align="left"
                          className={classes.tableCell}
                        >
                          {chain.published ? (
                            <div style={{ display: "flex" }}>
                              <span className="dot-active"></span>
                              <Typography variant="body2">
                                {"published"}
                              </Typography>
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
                        <TableCell align="right" className={classes.tableCell}>
                          <Button
                            variant="contained"
                            color="secondary"
                            className={classes.button}
                            onClick={(e) => {
                              e.preventDefault();
                              history.push(`/loops/members/${chain.id}`);
                            }}
                          >
                            {t("view")}
                            <img src={RightArrow} alt="" />
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
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
              />
            </TableContainer>
          </div>
        ) : (
          <Box className={classes.progressBox}>
            <CircularProgress
              color="inherit"
              className={classes.progressAnimation}
            />
            <h3>{t("loadingListOfAllLoops")}</h3>
          </Box>
        )}
      </div>
    </>
  );
};

export default ChainsList;
