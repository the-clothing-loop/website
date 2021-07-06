import { useState, useEffect } from "react";
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
import LocalOfferOutlinedIcon from "@material-ui/icons/LocalOfferOutlined";

// Project resources
import { getChain, updateChain } from "../util/firebase/chain";
import { getUsersForChain } from "../util/firebase/user";
import { IChain, IUser } from "../types";

type TParams = {
  chainId: string;
};

const ChainMemberList = () => {
  const { t } = useTranslation();
  const location = useLocation<any>();
  const { chainId } = useParams<TParams>();

  const [chain, setChain] = useState<IChain>();
  const [users, setUsers] = useState<IUser[]>();
  const [publishedValue, setPublishedValue] = useState({ published: true });
  const [error, setError] = useState("");

  const handleChange = (e: { target: { checked: boolean; name: any } }) => {
    setPublishedValue({ ...publishedValue, [e.target.name]: e.target.checked });

    const updatedChainData = {
      [e.target.name]: e.target.checked,
    };

    console.log(`updating chain data: ${JSON.stringify(updatedChainData)}`);
    try {
      updateChain(chainId, updatedChainData);
    } catch (e) {
      console.error(`Error updating chain: ${JSON.stringify(e)}`);
      setError(e.message);
    }
  };

  useEffect(() => {
    (async () => {
      try {
        const chainData = await getChain(chainId);
        setChain(chainData);
        const users = await getUsersForChain(chainId);
        setUsers(users);
        setPublishedValue({ published: chainData.published });
      } catch (error) {
        console.error(error);
      }
    })();
  }, []);

  return !chain || !users ? null : (
    <>
      <Helmet>
        <title>Clothing-chain | Chain members</title>
        <meta name="description" content="Chain members" />
      </Helmet>
      <div className="chain-member-list">
        <Card>
          <CardContent>
            {location.state ? (
              <p className="success">{location.state.message}</p>
            ) : null}
            <Typography variant="h3" component="h2">
              {chain.name}
            </Typography>
            <Link to={`/chains/edit/${chainId}`} className="chain-edit-btn">
              <EditIcon />
            </Link>

            <Typography
              variant="body1"
              component="p"
              style={{ display: "inline" }}
            >
              {chain.address}
            </Typography>

            <Typography
              variant="body1"
              component="p"
              style={{ display: "inline" }}
              color="textSecondary"
            >
              {chain.description}
            </Typography>

            <div className={"chain-categories-admin"}>
              {chain.categories
                ? chain.categories.gender.map((gender, i) => {
                    return (
                      <Typography
                        variant="body1"
                        component="p"
                        display="inline"
                        key={i}
                      >
                        <LocalOfferOutlinedIcon />
                        {gender}
                      </Typography>
                    );
                  })
                : null}
            </div>
            <div className="switch-wrapper">
              <Switch
                checked={publishedValue.published}
                onChange={handleChange}
                name="published"
                inputProps={{ "aria-label": "secondary checkbox" }}
              />
              {publishedValue.published ? (
                <Typography
                  variant="body1"
                  component="p"
                  style={{ color: "green" }}
                >
                  {"published"}
                </Typography>
              ) : (
                <Typography
                  variant="body1"
                  component="p"
                  style={{ color: "red" }}
                >
                  {"not published"}
                </Typography>
              )}
              {error ? <Alert severity="error">{error}</Alert> : null}
            </div>
          </CardContent>
        </Card>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>{t("name")}</TableCell>
              <TableCell>{t("address")}</TableCell>
              <TableCell>{t("phoneNumber")}</TableCell>
              <TableCell>{t("email")}</TableCell>
              <TableCell />
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map((u: IUser) => (
              <TableRow key={u.uid}>
                <TableCell>{u.name}</TableCell>
                <TableCell>{u.address}</TableCell>
                <TableCell>{u.phoneNumber}</TableCell>
                <TableCell>{u.email}</TableCell>
                <TableCell align="right">
                  <Link to={`/users/edit/${u.uid}`}>
                    <EditIcon />
                  </Link>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </>
  );
};

export default ChainMemberList;
