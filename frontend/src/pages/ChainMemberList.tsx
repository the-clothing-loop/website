import { useState, useEffect, useContext } from "react";
import { useParams, Link, useLocation } from "react-router-dom";
import { Helmet } from "react-helmet";
import { useTranslation } from "react-i18next";

// Material UI
import { Alert } from "@material-ui/lab";
import {
  Grid,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Typography,
  Switch,
  TablePagination,
  TableContainer,
  FormControlLabel,
} from "@material-ui/core";
import {
  EditOutlined as EditIcon,
  Clear as DeleteIcon,
} from "@material-ui/icons";
import { makeStyles } from "@material-ui/styles";

// Project resources
import { getChain, updateChain } from "../util/firebase/chain";
import { getUsersForChain, removeUserFromChain } from "../util/firebase/user";
import { IChain, IUser } from "../types";
import { AuthContext } from "../components/AuthProvider";
import { UserDataExport } from "../components/DataExport";
import Popover from "../components/Popover";

type TParams = {
  chainId: string;
};

const rows = ["name", "address", "email", "phone", "interested size"];

const useStyles = makeStyles({
  borderlessTableCellRoot: {
    borderBottom: "none",
  },
  headRowTableCellRoot: {
    paddingBottom: 24,
    borderBottom: "1px solid #C4C4C4",
    fontSize: 14,
    fontWeight: 400,
    lineHeight: "17px",
    color: "#C4C4C4",
  },
  descriptionTypographyRoot: {
    marginTop: 24,
    fontSize: 18,
  },
  titleTypographyRoot: {
    textTransform: "uppercase",
    fontSize: 36,
    fontWeight: 700,
  },
  fieldSubheadingTypographyRoot: {
    fontSize: 16,
    color: "#068C7C",
  },
  switchGroupRoot: {
    marginTop: 32,
  },
});

const ChainMemberList = () => {
  const location = useLocation<any>();
  const { chainId } = useParams<TParams>();
  const { userData } = useContext<any>(AuthContext);

  const [chain, setChain] = useState<IChain>();
  const [users, setUsers] = useState<IUser[]>();
  const [publishedValue, setPublishedValue] = useState({ published: true });
  const [error, setError] = useState("");

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const [admin, setAdmin] = useState<IUser>();
  const { t } = useTranslation();

  const handleChange = async (e: {
    target: { checked: boolean; name: any };
  }) => {
    setPublishedValue({ ...publishedValue, [e.target.name]: e.target.checked });

    const updatedChainData = {
      [e.target.name]: e.target.checked,
    };

    console.log(`updating chain data: ${JSON.stringify(updatedChainData)}`);
    try {
      await updateChain(chainId, updatedChainData);
    } catch (e: any) {
      console.error(`Error updating chain: ${JSON.stringify(e)}`);
      setError(e.message);
    }
  };

  //pagination
  const handleChangePage = (e: any, newPage: any) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (e: any) => {
    setRowsPerPage(+e.target.value);
    setPage(0);
  };

  useEffect(() => {
    (async () => {
      try {
        const chainData = await getChain(chainId);
        if (chainData === undefined) {
          console.error(`chain ${chainId} does not exist`);
        } else {
          setChain(chainData);
          const chainUsers = await getUsersForChain(chainId);
          setUsers(chainUsers);
          setPublishedValue({ published: chainData.published });
        }
      } catch (error) {
        console.error(`Error getting chain: ${error}`);
      }
    })();
  }, []);

  useEffect(() => {
    setAdmin(users?.find((user: IUser) => user.role === "chainAdmin"));
  }, [users]);

  const handleRemoveFromChain = async (userId: string) => {
    removeUserFromChain(userId);

    const chainUsers = await getUsersForChain(chainId);
    setUsers(chainUsers);
  };

  const classes = useStyles();

  return !chain || !users ? null : (
    <>
      <Helmet>
        <title>The Clothing Loop | Loop Members</title>
        <meta name="description" content="Loop Members" />
      </Helmet>

      <div className="chain-member-list">
        <Grid container direction="column" spacing={6}>
          <Grid item container spacing={4}>
            <Grid item sm>
              <div className="chain-member-list__card">
                {location.state ? (
                  <p className="success">{location.state.message}</p>
                ) : null}

                <Grid
                  container
                  alignItems="center"
                  justifyContent="space-between"
                  wrap="nowrap"
                  spacing={0}
                >
                  <Grid item>
                    <Title>{chain.name}</Title>
                  </Grid>
                  <Grid item>
                    <Link to={`/loops/edit/${chainId}`}>
                      <EditIcon />
                    </Link>
                  </Grid>
                </Grid>

                <Typography
                  classes={{ root: classes.descriptionTypographyRoot }}
                >
                  {chain.description}
                </Typography>

                <Field title="Categories">
                  {chain.categories?.gender &&
                    chain.categories.gender
                      .map((gender, i) => `${gender.toUpperCase()}'S CLOTHING`)
                      .join(" / ")}
                </Field>
                <Field title="Sizes">
                  {chain.categories?.size &&
                    chain.categories.size
                      .map((size, i) => size.toUpperCase())
                      .join(" / ")}
                </Field>
                <Field title="Participants">{`${users.length} ${
                  users.length === 1 ? "person" : "people"
                }`}</Field>

                <div style={{ position: "relative", display: "inline" }}>
                  <FormControlLabel
                    classes={{ root: classes.switchGroupRoot }}
                    value={publishedValue.published}
                    control={
                      <Switch
                        checked={publishedValue.published}
                        onChange={handleChange}
                        name="published"
                        inputProps={{ "aria-label": "secondary checkbox" }}
                      />
                    }
                    label={publishedValue.published ? "visible" : "invisible"}
                    labelPlacement="end"
                  />
                  <Popover message={t("adminSwitcherMessage")} />
                </div>
              </div>
            </Grid>
            <Grid item sm>
              <div className="chain-member-list__card">
                <Grid
                  container
                  alignItems="center"
                  justifyContent="space-between"
                  wrap="nowrap"
                >
                  <Grid item>
                    <Title>Loop Admin</Title>
                  </Grid>
                  <Grid item>
                    <Link to={`/users/edit/${admin?.uid}`}>
                      <EditIcon />
                    </Link>
                  </Grid>
                </Grid>

                <Field title="Name">{admin?.name}</Field>
                <Field title="Address">{admin?.address}</Field>
                <Field title="Email">{admin?.email}</Field>
                <Field title="Phone">{admin?.phoneNumber}</Field>
              </div>
            </Grid>
          </Grid>
          <Grid item>
            <div className="chain-member-list__card">
              <Title>Loop Participants</Title>
              <UserDataExport />

              <TableContainer className="chain-member-list__table--margin">
                <Table>
                  <TableHead>
                    <TableRow>
                      {rows.map((row, i) => {
                        return (
                          <HeadRowTableCell key={i}>{row}</HeadRowTableCell>
                        );
                      })}
                      {userData?.role === "admin" && (
                        <>
                          <HeadRowTableCell />
                          <HeadRowTableCell />
                        </>
                      )}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {users
                      .slice(
                        page * rowsPerPage,
                        page * rowsPerPage + rowsPerPage
                      )
                      .map((u: IUser) => (
                        <TableRow key={u.uid}>
                          <BorderlessTableCell>{u.name}</BorderlessTableCell>
                          <BorderlessTableCell>{u.address}</BorderlessTableCell>
                          <BorderlessTableCell>{u.email}</BorderlessTableCell>
                          <BorderlessTableCell>
                            {u.phoneNumber}
                          </BorderlessTableCell>
                          <BorderlessTableCell>
                            {u.interestedSizes?.join(", ")}
                          </BorderlessTableCell>
                          {userData?.role === "admin" && (
                            <>
                              <BorderlessTableCell>
                                <Link to={`/users/edit/${u.uid}`}>
                                  <EditIcon />
                                </Link>
                              </BorderlessTableCell>
                              <BorderlessTableCell>
                                <DeleteIcon
                                  onClick={() =>
                                    handleRemoveFromChain(u.uid as string)
                                  }
                                />
                              </BorderlessTableCell>
                            </>
                          )}
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>

                <TablePagination
                  rowsPerPageOptions={[5, 10, 25]}
                  component="div"
                  count={users.length}
                  rowsPerPage={rowsPerPage}
                  page={page}
                  onPageChange={handleChangePage}
                  onRowsPerPageChange={handleChangeRowsPerPage}
                />
              </TableContainer>
            </div>
          </Grid>
        </Grid>
      </div>
    </>
  );
};

const Title = ({ children }: { children: any }) => {
  const classes = useStyles();

  return (
    <Typography classes={{ root: classes.titleTypographyRoot }}>
      {children}
    </Typography>
  );
};

const Field = ({ title, children }: { title: string; children: any }) => {
  const classes = useStyles();

  return (
    <div className="chain-member-list__field">
      <Typography classes={{ root: classes.fieldSubheadingTypographyRoot }}>
        {title}:
      </Typography>
      <div className="chain-member-list__field-content">{children}</div>
    </div>
  );
};

const BorderlessTableCell = ({ children, ...props }: { children: any }) => {
  const classes = useStyles();

  return (
    <TableCell classes={{ root: classes.borderlessTableCellRoot }} {...props}>
      {children}
    </TableCell>
  );
};

const HeadRowTableCell = ({ children, ...props }: { children?: any }) => {
  const classes = useStyles();

  return (
    <TableCell
      classes={{ root: classes.headRowTableCellRoot }}
      variant="head"
      {...props}
    >
      {children}
    </TableCell>
  );
};

export default ChainMemberList;
