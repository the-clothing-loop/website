import { useState, useEffect, useContext } from "react";
import { useParams, Link, useLocation } from "react-router-dom";
import { Helmet } from "react-helmet";
import { useTranslation } from "react-i18next";

import {
  Alert,
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
} from "@mui/material";
import {
  EditOutlined as EditIcon,
  Clear as DeleteIcon,
} from "@mui/icons-material";
import { makeStyles } from "@mui/styles";

// Project resources
import { getChain, updateChain } from "../util/firebase/chain";
import theme from "../util/theme";
import { getUsersForChain, removeUserFromChain } from "../util/firebase/user";
import { IChain, IUser } from "../types";
import { AuthContext, AuthProps } from "../components/AuthProvider";
import { UserDataExport } from "../components/DataExport";
import Popover from "../components/Popover";
import { ChainParticipantsTable } from "../components/ChainParticipantsTable";
import { Title } from "../components/Typography";

type TParams = {
  chainId: string;
};

const memberColumns = [
  { headerName: "name", propertyName: "name" },
  { headerName: "address", propertyName: "address" },
  { headerName: "email", propertyName: "email" },
  { headerName: "phone", propertyName: "phoneNumber" },
  { headerName: "interested size", propertyName: "interestedSizes" },
];

const adminColumns = [
  { headerName: "name", propertyName: "name" },
  { headerName: "email", propertyName: "email" },
  { headerName: "phone", propertyName: "phoneNumber" },
];

const useStyles = makeStyles(theme as any);

const ChainMemberList = () => {
  const location = useLocation<any>();
  const { chainId } = useParams<TParams>();
  const { userData }: { userData: IUser | null } =
    useContext<AuthProps>(AuthContext);

  const [chain, setChain] = useState<IChain>();
  const [users, setUsers] = useState<IUser[]>();
  const [publishedValue, setPublishedValue] = useState({ published: true });
  const [error, setError] = useState("");

  const [isChainAdmin, setIsChainAdmin] = useState<boolean>();
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
    setIsChainAdmin(
      users
        ?.filter((user: IUser) => user.role === "chainAdmin")
        .some((user: IUser) => user.uid === userData?.uid)
    );
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
                    <Link to={`/loops/${chainId}/edit`}>
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
                <div className="chain-member-list__loop-admin__flex-col">
                  <div>
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
                        <Link to={`/users/${(userData as IUser).uid}/edit`}>
                          <EditIcon />
                        </Link>
                      </Grid>
                    </Grid>
                    <ChainParticipantsTable
                      columns={adminColumns}
                      userData={userData}
                      users={users.filter(
                        (user: IUser) => user.role === "chainAdmin"
                      )}
                      initialPage={0}
                      initialRowsPerPage={10}
                      editItemComponent={(u: IUser) => (
                        <Link to={`/users/${u.uid}/edit`}>
                          <EditIcon />
                        </Link>
                      )}
                      deleteItemComponent={(u: IUser) => (
                        <DeleteIcon
                          onClick={() => handleRemoveFromChain(u.uid as string)}
                        />
                      )}
                    />
                  </div>
                  {isChainAdmin && (
                    <Link
                      to={{
                        pathname: `/loops/${chainId}/addChainAdmin`,
                        state: { users, chainId },
                      }}
                    >
                      <div className="chain-member-list__add-co-host">
                        add co-host
                      </div>
                    </Link>
                  )}
                </div>
              </div>
            </Grid>
          </Grid>

          <Grid item>
            <div className="chain-member-list__card">
              <Title>Loop Participants</Title>
              <UserDataExport />

              <ChainParticipantsTable
                columns={memberColumns}
                userData={userData}
                users={users}
                initialPage={0}
                initialRowsPerPage={10}
                editItemComponent={(u: IUser) => (
                  <Link to={`/users/${u.uid}/edit`}>
                    <EditIcon />
                  </Link>
                )}
                deleteItemComponent={(u: IUser) => (
                  <DeleteIcon
                    onClick={() => handleRemoveFromChain(u.uid as string)}
                  />
                )}
              />
            </div>
          </Grid>
        </Grid>
      </div>
    </>
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

export default ChainMemberList;
