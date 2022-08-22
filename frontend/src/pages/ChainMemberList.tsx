import { useState, useEffect, useContext } from "react";
import { useParams, Link, useLocation } from "react-router-dom";
import { Helmet } from "react-helmet";
import { useTranslation } from "react-i18next";

import { Grid, Typography, Switch, FormControlLabel } from "@mui/material";
import {
  EditOutlined as EditIcon,
  Clear as DeleteIcon,
} from "@mui/icons-material";
import { makeStyles } from "@mui/styles";

// Project resources
import theme from "../util/theme";
import { getUsersForChain, removeUserFromChain } from "../util/firebase/user";
import { IUser } from "../types";
import { AuthContext, AuthProps } from "../components/AuthProvider";
import { UserDataExport } from "../components/DataExport";
import Popover from "../components/Popover";
import { ChainParticipantsTable } from "../components/ChainParticipantsTable";
import { Title } from "../components/Typography";
import { chainGet, chainUpdate, ChainUpdateBody } from "../api/chain";
import { Chain } from "../api/types";
import { Gender, Size } from "../api/enums";

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

  const [chain, setChain] = useState<Chain>();
  const [users, setUsers] = useState<IUser[]>();
  const [switcherValues, setSwitcherValues] = useState({
    published: true,
    openToNewMembers: true,
  });
  const [error, setError] = useState("");

  const [isChainAdmin, setIsChainAdmin] = useState<boolean>();
  const { t } = useTranslation();

  const handleChange = async (e: {
    target: { checked: boolean; name: any };
  }) => {
    setSwitcherValues({ ...switcherValues, [e.target.name]: e.target.checked });

    let updatedChainData = {
      [e.target.name]: e.target.checked,
    } as any;

    console.log(`updating chain data: ${JSON.stringify(updatedChainData)}`);
    try {
      updatedChainData.uid = chainId
      await chainUpdate(updatedChainData as any);
    } catch (e: any) {
      console.error(`Error updating chain: ${JSON.stringify(e)}`);
      setError(e.message);
    }
  };

  useEffect(() => {
    (async () => {
      try {
        const chainData = (await chainGet(chainId)).data;
        if (chainData === undefined) {
          console.error(`chain ${chainId} does not exist`);
        } else {
          setChain(chainData);
          const chainUsers = await getUsersForChain(chainId);
          setUsers(chainUsers);
          setSwitcherValues({
            published: chainData.published,
            openToNewMembers: chainData.openToNewMembers,
          });
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
          <Grid
            item
            classes={{ root: classes.gridItemsNoPadding }}
            container
            spacing={4}
          >
            <Grid item classes={{ root: classes.gridItemsNoPadding }} sm>
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
                  {chain?.genders &&
                    chain?.genders
                      .map((gender, i) => `${Gender[gender as keyof typeof Gender]}'S CLOTHING`)
                      .join(" / ")}
                </Field>
                <Field title="Sizes">
                  {chain?.sizes &&
                    chain?.sizes
                      .map((size, i) => t(`${Size[size as keyof typeof Size]}`))
                      .join(" / ")}
                </Field>
                <Field title="Participants">{`${users.length} ${
                  users.length === 1 ? "person" : "people"
                }`}</Field>

                <Grid container spacing={2}>
                  <Grid item sm={12} md={6}>
                    <div style={{ position: "relative", display: "inline" }}>
                      <FormControlLabel
                        classes={{ root: classes.switchGroupRoot }}
                        value={switcherValues.published}
                        control={
                          <Switch
                            checked={switcherValues.published}
                            onChange={handleChange}
                            name="published"
                            color="secondary"
                            inputProps={{ "aria-label": "secondary checkbox" }}
                          />
                        }
                        label={
                          switcherValues.published
                            ? t<string>("visible")
                            : t<string>("invisible")
                        }
                        labelPlacement="end"
                      />
                      <Popover
                        message={t("adminLoopVisibleMessage")}
                        style={{ paddingTop: 0 }}
                      />
                    </div>
                  </Grid>
                  <Grid item sm={12} md={6}>
                    <div style={{ position: "relative", display: "inline" }}>
                      <FormControlLabel
                        classes={{ root: classes.switchGroupRoot }}
                        value={switcherValues.openToNewMembers}
                        control={
                          <Switch
                            checked={switcherValues.openToNewMembers}
                            onChange={handleChange}
                            name="openToNewMembers"
                            color="secondary"
                            inputProps={{ "aria-label": "secondary checkbox" }}
                          />
                        }
                        label={
                          switcherValues.openToNewMembers
                            ? t<string>("open")
                            : t<string>("closed")
                        }
                        labelPlacement="end"
                      />
                      <Popover
                        message={t("adminLoopOpenMessage")}
                        style={{ paddingTop: 0 }}
                      />
                    </div>
                  </Grid>
                </Grid>
              </div>
            </Grid>

            <Grid item classes={{ root: classes.gridItemsNoPadding }} sm>
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

          <Grid item classes={{ root: classes.gridItemsNoPadding }}>
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
