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
import { getUser, updateUser } from "../util/firebase/user"
import { IUser } from "../types";
import TextField from "../components/TextField";

const UserEdit = () => {
  const { t } = useTranslation();
  const { userId } = useParams();
  const [user, setUser] = useState();
  const [chainId, setChainId] = useState();
  const classes = makeStyles(theme.form)();
  const { register, handleSubmit, setValue } = useForm();
  const history = useHistory();

  const onSubmit = (user) => {
    updateUser(userId, user);
    history.push({ pathname:`/chains/${chainId}`, state: { message: t("saved") } });
  };

  useEffect(() => {
    (async function() {
      try {
        const user = await getUser(userId);
        setUser(user);
        setChainId(user.chainId.id);
        const fields = ['name', 'address', 'email', 'phoneNumber'];
        fields.forEach((field) => setValue(field, user[field]));
      } catch(error) {
        console.error(error);
      }
    })();
  }, [userId]);

  return !user ? null : (
    <Grid container className={classes.form}>
      <Grid item sm />
      <Grid item sm>
        <Typography variant="h3" className={classes.pageTitle}>
          {t("editUserDetails")}
        </Typography>

        <form onSubmit={handleSubmit(onSubmit)}>
          <TextField fieldName="name" inputRef={register} />
          <TextField fieldName="address" inputRef={register} />
          <TextField fieldName="email" inputRef={register} />
          <TextField fieldName="phoneNumber" inputRef={register} />

          <Button type="submit" variant="contained" color="primary" className={classes.button}>
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

export default UserEdit;
