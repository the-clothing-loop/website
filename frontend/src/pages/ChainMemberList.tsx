import { useState, useEffect, useContext } from "react";
import { useParams, Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Helmet } from "react-helmet";

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
import Switch from "@material-ui/core/Switch";
import { Alert } from "@material-ui/lab";
import TablePagination from "@material-ui/core/TablePagination";
import Divider from "@material-ui/core/Divider";
import Chip from "@material-ui/core/Chip";

// Project resources
import { getChain, updateChain } from "../util/firebase/chain";
import { getUsersForChain } from "../util/firebase/user";
import { IChain, IUser } from "../types";
import { AuthContext } from "../components/AuthProvider";

type TParams = {
  chainId: string;
};

const rows = ["name", "address", "phone number", "email"];

const ChainMemberList = () => {
  const { t } = useTranslation();
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
    } catch (e:any) {
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
        setChain(chainData);
        const chainUsers = await getUsersForChain(chainId);
        setUsers(chainUsers);
        setPublishedValue({ published: chainData.published });
      } catch (error) {
        console.error(error);
      }
    })();
  }, []);

  useEffect(() => {
    setAdmin(users?.find((user: IUser) => user.role === "chainAdmin"));
  }, [users]);

  return !chain || !users ? null : (
    <>
      <Helmet>
        <title>Clothing-Loop | Loop Members</title>
        <meta name="description" content="Loop Members" />
      </Helmet>
      <div className="chain-member-list">
        <Card>
          <CardContent>
            {location.state ? (
              <p className="success">{location.state.message}</p>
            ) : null}
            <Typography
              variant="body1"
              component="p"
              style={{ textTransform: "uppercase", fontWeight: "bold" }}
            >
              {chain.name}
              <Link to={`/loops/edit/${chainId}`} className="chain-edit-btn">
                <EditIcon style={{ float: "right" }} />
              </Link>
            </Typography>

            <Typography
              variant="body2"
              component="p"
              style={{ display: "inline" }}
            >
              {chain.address}
            </Typography>

            <div className="switch-wrapper">
              <Switch
                checked={publishedValue.published}
                onChange={handleChange}
                name="published"
                inputProps={{ "aria-label": "secondary checkbox" }}
              />
              {publishedValue.published ? (
                <Typography variant="body2" component="p">
                  {"published"}
                </Typography>
              ) : (
                <Typography variant="body2" component="p">
                  {"unpublished"}
                </Typography>
              )}
              {error ? <Alert severity="error">{error}</Alert> : null}
            </div>
            <Divider style={{ margin: "2% 0" }} />

            <div className={"chain-categories-admin"}>
              {chain.categories?.gender
                ? chain.categories.gender.map((gender, i) => {
                    return (
                      <Chip
                        key={i}
                        label={`${gender}'s clothing`}
                        color="primary"
                        style={{ marginRight: "1%" }}
                      />
                    );
                  })
                : null}

              {chain.categories?.size
                ? chain.categories.size.map((size, i) => {
                    return (
                      <Chip
                        key={i}
                        label={size}
                        color="primary"
                        style={{
                          textTransform: "uppercase",
                          marginRight: "1%",
                        }}
                      />
                    );
                  })
                : null}
            </div>
          </CardContent>
        </Card>
        {admin ? (
          <div>
            <Typography variant="h6">{"admin contacts"}</Typography>

            <Table>
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
                <TableRow key={admin.uid}>
                  <TableCell>{admin.name}</TableCell>
                  <TableCell>{admin.address}</TableCell>
                  <TableCell>{admin.phoneNumber}</TableCell>
                  <TableCell>{admin.email}</TableCell>
                  {userData?.role === "admin" ? (
                    <TableCell align="right">
                      <Link to={`/users/edit/${admin.uid}`}>
                        <EditIcon />
                      </Link>
                    </TableCell>
                  ) : null}
                </TableRow>
              </TableBody>
            </Table>
          </div>
        ) : null}

        <Typography variant="h6">{`${users.length} active users`}</Typography>

        <Table>
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
            {users
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((u: IUser) => (
                <TableRow key={u.uid}>
                  <TableCell>{u.name}</TableCell>
                  <TableCell>{u.address}</TableCell>
                  <TableCell>{u.phoneNumber}</TableCell>
                  <TableCell>{u.email}</TableCell>
                  {userData?.role === "admin" ? (
                    <TableCell align="right">
                      <Link to={`/users/edit/${u.uid}`}>
                        <EditIcon />
                      </Link>
                    </TableCell>
                  ) : null}
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
          onChangePage={handleChangePage}
          onChangeRowsPerPage={handleChangeRowsPerPage}
        />
      </div>
    </>
  );
};

export default ChainMemberList;
