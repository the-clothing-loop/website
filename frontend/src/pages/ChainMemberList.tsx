import {
  useState,
  useEffect,
  useContext,
  ChangeEvent,
  PropsWithChildren,
} from "react";
import { useParams, Link, useHistory, Redirect } from "react-router-dom";
import { Helmet } from "react-helmet";
import { useTranslation } from "react-i18next";

import {
  Grid,
  Typography,
  Switch,
  FormControlLabel,
  Alert,
} from "@mui/material";
import { EditOutlined as EditIcon } from "@mui/icons-material";
import { makeStyles } from "@mui/styles";

// Project resources
import theme from "../util/theme";
import { AuthContext, AuthProps } from "../providers/AuthProvider";
import { UserDataExport } from "../components/DataExport";
import Popover from "../components/Popover";
import {
  ChainParticipantsTable,
  TableUserColumn,
} from "../components/ChainParticipantsTable";
import { Title } from "../components/Typography";
import { chainGet, chainRemoveUser, chainUpdate } from "../api/chain";
import { Chain, User } from "../api/types";
import { GenderI18nKeys, SizeI18nKeys } from "../api/enums";
import { userGetAllByChain } from "../api/user";

interface Params {
  chainUID: string;
}

const memberColumns: TableUserColumn[] = [
  { headerName: "name", propertyName: "name" },
  { headerName: "address", propertyName: "address" },
  { headerName: "email", propertyName: "email" },
  { headerName: "phone", propertyName: "phone_number" },
  { headerName: "interested size", propertyName: "sizes" },
];

const adminColumns: TableUserColumn[] = [
  { headerName: "name", propertyName: "name" },
  { headerName: "email", propertyName: "email" },
  { headerName: "phone", propertyName: "phone_number" },
];

const useStyles = makeStyles(theme as any);

const ChainMemberList = () => {
  const history = useHistory();
  const { chainUID } = useParams<Params>();
  const { authUser } = useContext<AuthProps>(AuthContext);

  const [chain, setChain] = useState<Chain | null>(null);
  const [users, setUsers] = useState<User[] | null>(null);
  const [published, setPublished] = useState(true);
  const [openToNewMembers, setOpenToNewMembers] = useState(true);
  const [error, setError] = useState("");
  const { t } = useTranslation();

  async function handleChangePublished(e: ChangeEvent<HTMLInputElement>) {
    let isChecked = e.target.checked;
    let oldValue = published;
    setPublished(isChecked);

    try {
      await chainUpdate({
        uid: chainUID,
        published: isChecked,
      });
    } catch (e: any) {
      console.error(`Error updating chain: ${JSON.stringify(e)}`);
      setError(e?.data || `Error: ${JSON.stringify(e)}`);
      setPublished(oldValue);
    }
  }

  async function handleChangeOpenToNewMembers(
    e: ChangeEvent<HTMLInputElement>
  ) {
    let isChecked = e.target.checked;
    let oldValue = openToNewMembers;
    setOpenToNewMembers(isChecked);

    try {
      await chainUpdate({
        uid: chainUID,
        openToNewMembers: isChecked,
      });
    } catch (e: any) {
      console.error(`Error updating chain: ${JSON.stringify(e)}`);
      setError(e?.data || `Error: ${JSON.stringify(e)}`);
      setOpenToNewMembers(oldValue);
    }
  }

  useEffect(() => {
    (async () => {
      try {
        const chainData = (await chainGet(chainUID)).data;
        setChain(chainData);
        const chainUsers = (await userGetAllByChain(chainUID)).data;
        setUsers(chainUsers);
        setPublished(chainData.published);
        setOpenToNewMembers(chainData.openToNewMembers);
      } catch (error: any) {
        console.error(`Error getting chain: ${error}`);
      }
    })();
  }, [history]);

  async function handleRemoveFromChain(userUID: string) {
    await chainRemoveUser(chainUID, userUID);

    const chainUsers = (await userGetAllByChain(chainUID)).data;
    setUsers(chainUsers);
  }

  const classes = useStyles();

  if (!chain || !users) {
    return null;
  }
  return (
    <>
      <Helmet>
        <title>The Clothing Loop | Loop Members</title>
        <meta name="description" content="Loop Members" />
      </Helmet>

      <div className="chain-member-list">
        {error && (
          <Alert sx={{ marginBottom: 4 }} severity="error">
            {error}
          </Alert>
        )}
        <Grid container direction="column" spacing={6}>
          <Grid
            item
            classes={{ root: classes.gridItemsNoPadding }}
            container
            spacing={4}
          >
            <Grid item classes={{ root: classes.gridItemsNoPadding }} sm>
              <div className="chain-member-list__card">
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
                    <Link to={`/loops/${chainUID}/edit`}>
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
                      .map((g) => `${GenderI18nKeys[g]}'S CLOTHING`)
                      .join(" / ")}
                </Field>
                <Field title="Sizes">
                  {chain?.sizes &&
                    chain?.sizes.map((s) => t(SizeI18nKeys[s])).join(" / ")}
                </Field>
                <Field title="Participants">{`${users.length} ${
                  users.length === 1 ? "person" : "people"
                }`}</Field>

                <div style={{ position: "relative" }}>
                  <FormControlLabel
                    classes={{ root: classes.switchGroupRoot }}
                    value={published}
                    control={
                      <Switch
                        checked={published}
                        onChange={handleChangePublished}
                        name="published"
                        color="secondary"
                        inputProps={{ "aria-label": "secondary checkbox" }}
                      />
                    }
                    label={published ? "published" : "draft"}
                    labelPlacement="end"
                  />
                  <Popover message={t("adminSwitcherMessage")} />
                </div>
                <div>
                  <FormControlLabel
                    classes={{ root: classes.switchGroupRoot }}
                    value={openToNewMembers}
                    control={
                      <Switch
                        checked={openToNewMembers}
                        onChange={handleChangeOpenToNewMembers}
                        name="published"
                        color="secondary"
                        inputProps={{ "aria-label": "secondary checkbox" }}
                      />
                    }
                    label={openToNewMembers ? "open to new members" : "closed"}
                    labelPlacement="end"
                  />
                </div>
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
                        <Link
                          to={{
                            pathname: `/users/${authUser?.uid}/edit`,
                            state: {
                              chainUID: chainUID,
                            },
                          }}
                        >
                          <EditIcon />
                        </Link>
                      </Grid>
                    </Grid>
                    <ChainParticipantsTable
                      columns={adminColumns}
                      authUser={authUser}
                      users={users.filter(
                        (u) =>
                          u.chains.find(
                            (c) => c.chain_uid === chain.uid && c.is_chain_admin
                          ) !== undefined
                      )}
                      chainUID={chain.uid}
                      initialPage={0}
                      edit
                      remove
                      onRemoveUser={handleRemoveFromChain}
                    />
                  </div>

                  <Link
                    to={{
                      pathname: `/loops/${chainUID}/addChainAdmin`,
                      state: { users, chainUID },
                    }}
                  >
                    <div className="chain-member-list__add-co-host">
                      add co-host
                    </div>
                  </Link>
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
                authUser={authUser}
                users={users}
                chainUID={chain.uid}
                initialPage={0}
                edit
                remove
                onRemoveUser={handleRemoveFromChain}
              />
            </div>
          </Grid>
        </Grid>
      </div>
    </>
  );
};

function Field(props: PropsWithChildren<{ title: string }>) {
  const classes = useStyles();

  return (
    <div className="chain-member-list__field">
      <Typography classes={{ root: classes.fieldSubheadingTypographyRoot }}>
        {props.title}:
      </Typography>
      <div className="chain-member-list__field-content">{props.children}</div>
    </div>
  );
}

export default ChainMemberList;
