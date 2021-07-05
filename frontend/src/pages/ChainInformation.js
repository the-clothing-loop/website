import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Helmet } from "react-helmet";

// Material UI
import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";
import Typography from "@material-ui/core/Typography";
import Table from "@material-ui/core/Table";
import TableHead from "@material-ui/core/TableHead";
import TableBody from "@material-ui/core/TableBody";
import TableRow from "@material-ui/core/TableRow";
import TableCell from "@material-ui/core/TableCell";
import LocationOnIcon from "@material-ui/icons/LocationOn";

// Project resources
import { getChain } from "../util/firebase/chain";

const ChainInformation = () => {
  const { chainId } = useParams();
  const [chain, setChain] = useState();
  const { t } = useTranslation();

  useEffect(() => {
    getChain(chainId).then((response) => setChain(response));
  }, []);

  return chain ? <>
    <Helmet>
      <title>Clothing-chain | Chain details</title>
      <meta name="description" content="Chain details" />
    </Helmet>
    <div className={"chain-details"}>
      <Card>
        <CardContent>
          <Typography variant="h3" component="h2">
            {chain.name}
          </Typography>
          <LocationOnIcon />
          <Typography
            variant="body2"
            component="p"
            style={{ display: "inline" }}
          >
            {chain.address}
          </Typography>
          <Typography variant="body2" component="p">
            {chain.description}
          </Typography>{" "}
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
          <TableRow>
            <TableCell>host name here</TableCell>
            <TableCell>host address here</TableCell>
            <TableCell>host email here</TableCell>
            <TableCell>host phone nr here</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  </> : null;
};

export default ChainInformation;
