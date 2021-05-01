import { useState, useEffect } from "react";
import { useParams, useHistory } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useForm } from "react-hook-form";

// Material UI
import Grid from "@material-ui/core/Grid";
import Typography from "@material-ui/core/Typography";
import Button from "@material-ui/core/Button";
import { makeStyles } from "@material-ui/core";
import theme from "../util/theme";


// Project resources
import { getChain, updateChain } from "../util/firebase/chain";
import { IChain } from "../types";
import { TextFormField } from "../components/FormFields";
import GeocoderSelector from "../components/GeocoderSelector";

const ChainEdit = () => {
  const { t } = useTranslation();
  const {chainId} = useParams()
  const [chain, setChain] = useState();
  const classes = makeStyles(theme)();
  const { register, handleSubmit, setValue } = useForm();
  const history = useHistory();
  const [address, setAddress] = useState();

  const onSubmit = (formData) => {
    let chain = {
      ...formData,
      address: address,
    };
    updateChain(chainId, chain);
    history.push({
      pathname: `/chains/${chainId}`,
      state: { message: t("saved") },
    });
    console.log("submitted");
  };

  useEffect(async () => {
    const chain = await getChain(chainId);
    setChain(chain);
  }, []);

  return !chain ? null : (
    <Grid container className={classes.form}>
      <Grid item sm />
      <Grid item sm>
        <Typography variant="h3" className={classes.pageTitle}>
          {t("edit chain details")}
        </Typography>

        <form onSubmit={handleSubmit(onSubmit)}>
          <TextFormField
            fieldName="description"
            inputRef={register}
            name={"description"}
          />
          <GeocoderSelector onResult={(e) => setAddress(e.result.place_name)} />

          <Button
            type="submit"
            variant="contained"
            color="primary"
            className={classes.button}
          >
            {t("save")}
          </Button>
          <Button variant="contained" href={`/chains/${chainId}`}>
            {t("cancel")}
          </Button>
        </form>
      </Grid>
      <Grid item sm />
    </Grid>
  );
};

export default ChainEdit;
