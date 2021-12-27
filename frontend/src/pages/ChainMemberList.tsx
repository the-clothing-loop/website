import { useState, useEffect, useContext } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet';

// Material UI
import { Alert } from '@material-ui/lab';
import {
  Grid,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Card,
  CardContent,
  Typography,
  Switch,
  TablePagination,
  TableContainer,
} from '@material-ui/core';
import {
  EditOutlined as EditIcon,
  Clear as DeleteIcon,
} from '@material-ui/icons';

// Project resources
import { getChain, updateChain } from '../util/firebase/chain';
import { getUsersForChain, removeUserFromChain } from '../util/firebase/user';
import { IChain, IUser } from '../types';
import { AuthContext } from '../components/AuthProvider';

type TParams = {
  chainId: string;
};

const rows = ['name', 'address', 'email', 'phone', 'interested size'];

const ChainMemberList = () => {
  const location = useLocation<any>();
  const { chainId } = useParams<TParams>();
  const { userData } = useContext<any>(AuthContext);

  const [chain, setChain] = useState<IChain>();
  const [users, setUsers] = useState<IUser[]>();
  const [publishedValue, setPublishedValue] = useState({ published: true });
  const [error, setError] = useState('');

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
    setAdmin(users?.find((user: IUser) => user.role === 'chainAdmin'));
  }, [users]);

  const handleRemoveFromChain = async (userId: string) => {
    removeUserFromChain(userId);

    const chainUsers = await getUsersForChain(chainId);
    setUsers(chainUsers);
  };

  return !chain || !users ? null : (
    <>
      <Helmet>
        <title>Clothing-Loop | Loop Members</title>
        <meta name="description" content="Loop Members" />
      </Helmet>
      <Grid container direction="column" style={{ backgroundColor: 'white' }}>
        <Grid item container spacing={4}>
          <Grid item sm>
            <Card raised>
              <CardContent>
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
                    <Typography
                      style={{
                        textTransform: 'uppercase',
                        fontWeight: 700,
                        fontSize: 36,
                      }}
                    >
                      {chain.name}
                    </Typography>
                  </Grid>
                  <Grid item>
                    <Link to={`/loops/edit/${chainId}`}>
                      <EditIcon />
                    </Link>
                  </Grid>
                </Grid>

                {chain.description}

                <Field
                  title="Categories"
                  content={
                    chain.categories?.gender &&
                    chain.categories.gender
                      .map((gender, i) => `${gender.toUpperCase()}'S CLOTHING`)
                      .join(' / ')
                  }
                />
                <Field
                  title="Sizes"
                  content={
                    chain.categories?.size &&
                    chain.categories.size
                      .map((size, i) => size.toUpperCase())
                      .join(' / ')
                  }
                />
                <Field
                  title="Participants"
                  content={`${users.length} ${
                    users.length === 1 ? 'person' : 'people'
                  }`}
                />

                <Grid container alignItems="center">
                  <Grid item>
                    <Switch
                      checked={publishedValue.published}
                      onChange={handleChange}
                      name="published"
                      inputProps={{ 'aria-label': 'secondary checkbox' }}
                    />
                  </Grid>
                  <Grid item>
                    {publishedValue.published ? (
                      <Typography variant="body2" component="p">
                        {'published'}
                      </Typography>
                    ) : (
                      <Typography variant="body2" component="p">
                        {'unpublished'}
                      </Typography>
                    )}
                  </Grid>
                  {error ? <Alert severity="error">{error}</Alert> : null}
                </Grid>
              </CardContent>
            </Card>
          </Grid>
          <Grid item sm>
            <Card raised>
              <CardContent>
                <Grid
                  container
                  alignItems="center"
                  justifyContent="space-between"
                  wrap="nowrap"
                >
                  <Grid item>
                    <Typography
                      style={{
                        textTransform: 'uppercase',
                        fontWeight: 700,
                        fontSize: 36,
                      }}
                    >
                      Loop Admin
                    </Typography>
                  </Grid>
                  <Grid item>
                    <Link to={`/loops/edit/${chainId}`}>
                      <EditIcon />
                    </Link>
                  </Grid>
                </Grid>

                <Field title="Name" content={admin?.name} />
                <Field title="Address" content={admin?.address} />
                <Field title="Email" content={admin?.email} />
                <Field title="Phone" content={admin?.phoneNumber} />
              </CardContent>
            </Card>
          </Grid>
        </Grid>
        <Grid item>
          <Card raised>
            <CardContent>
              <Typography
                style={{
                  textTransform: 'uppercase',
                  fontWeight: 700,
                  fontSize: 36,
                }}
              >
                Loop Participants
              </Typography>

              <TableContainer>
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
                      {userData?.role === 'admin' && (
                        <>
                          <TableCell component="th" />
                          <TableCell component="th" />
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
                          <TableCell>{u.name}</TableCell>
                          <TableCell>{u.address}</TableCell>
                          <TableCell>{u.email}</TableCell>
                          <TableCell>{u.phoneNumber}</TableCell>
                          <TableCell>{u.interestedSizes?.join(', ')}</TableCell>
                          {userData?.role === 'admin' && (
                            <>
                              <TableCell align="right">
                                <Link to={`/users/edit/${u.uid}`}>
                                  <EditIcon />
                                </Link>
                              </TableCell>
                              <TableCell align="right">
                                <DeleteIcon
                                  onClick={() =>
                                    handleRemoveFromChain(u.uid as string)
                                  }
                                />
                              </TableCell>
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
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </>
  );
};

const Field = ({ title, content }: { title: string; content: any }) => (
  <>
    <Typography style={{ fontSize: 16, color: '#068C7C' }}>{title}:</Typography>
    <div style={{ marginTop: 12, marginLeft: 44 }}>{content}</div>
  </>
);

export default ChainMemberList;
