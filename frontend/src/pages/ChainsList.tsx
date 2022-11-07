import { useState, useContext, useEffect } from "react";
import { useHistory } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Helmet } from "react-helmet";

import {
  Alert,
  Button,
  CircularProgress,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TablePagination,
  Paper,
  TableContainer,
  Box,
  Typography,
} from "@mui/material";
import { makeStyles } from "@mui/styles";

//media
import RightArrow from "../images/right-arrow-white.svg";

// Project resources
import { ChainsContext } from "../providers/ChainsProvider";
import { DataExport } from "../components/DataExport";
import theme from "../util/theme";
import { AuthContext } from "../providers/AuthProvider";
import { chainGet } from "../api/chain";
import { Chain } from "../api/types";

const rows = ["name", "location", "status"];

const ChainsList = () => {
  const { t } = useTranslation();
  const classes = makeStyles(theme as any)();
  const history = useHistory();
  const { authUser } = useContext(AuthContext);
  const allChains = useContext(ChainsContext);
  const [chains, setChains] = useState<Chain[]>();
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      if (authUser) {
        try {
          if (authUser.is_root_admin) {
            setChains(allChains);
          } else {
            let data = await Promise.all(
              authUser.chains.map((c) => chainGet(c.chain_uid))
            );

            setChains(data.map((d) => d.data));
          }
        } catch (rej: any) {
          setError(rej?.data || "Unknown error");
        }
      }
    })();
  }, [authUser]);

  return (
    <>
      <Helmet>
        <title>The Clothing Loop | Loops List</title>
        <meta name="description" content="Loops List" />z
      </Helmet>
      <div>
        {chains ? (
          <div className="tw-py-0 tw-px-20">
            <div className="table-head">
              <Typography variant="h5">{`${chains.length} Clothing Loops`}</Typography>
              <DataExport />
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
                  {chains.map((chain, i) => {
                    let isUserAdmin =
                      authUser?.chains.find((uc) => uc.chain_uid === chain.uid)
                        ?.is_chain_admin || false;
                    return (
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
                              <span className="feather feather-circle tw-mr-1 tw-bg-green" />
                              <Typography variant="body2">
                                {"published"}
                              </Typography>
                            </div>
                          ) : (
                            <div style={{ display: "flex" }}>
                              <Typography variant="body2">
                                <span className="feather feather-circle tw-mr-1 tw-bg-red" />
                                {"unpublished"}
                              </Typography>
                            </div>
                          )}
                        </TableCell>
                        <TableCell align="right" className={classes.tableCell}>
                          {(isUserAdmin || authUser?.is_root_admin) && (
                            <Button
                              variant="contained"
                              color="secondary"
                              className={classes.button}
                              onClick={(e) => {
                                e.preventDefault();
                                history.push(`/loops/${chain.uid}/members`);
                              }}
                            >
                              {t("view")}
                              <img src={RightArrow} alt="" />
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
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
