import { useState, useEffect } from "react";
import { useParams, useHistory } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useForm } from "react-hook-form";
import { Helmet } from "react-helmet";

// Material UI
import Grid from "@material-ui/core/Grid";
import Typography from "@material-ui/core/Typography";
import Button from "@material-ui/core/Button";
import { makeStyles } from "@material-ui/core";
import theme from "../util/theme";

// Project resources
import { getUserById, updateUser } from "../util/firebase/user";
import { PhoneFormField, TextFormField } from "../components/FormFields";

const UserEdit = () => {
  const { t } = useTranslation();
  const { userId } = useParams();
  const [user, setUser] = useState();
  const [chainId, setChainId] = useState();
  const classes = makeStyles(theme)();
  const { register, handleSubmit, setValue } = useForm();
  const history = useHistory();

  const onSubmit = (user) => {
    updateUser(userId, user);
    history.push({
      pathname: `/chains/members/${chainId}`,
      state: { message: t("saved") },
    });
  };

  useEffect(() => {
    (async () => {
      try {
        const user = await getUserById(userId);
        setUser(user);
        setChainId(user.chainId);
        const fields = ["name", "address", "email", "phoneNumber"];
        fields.forEach((field) => setValue(field, user[field]));
      } catch (error) {
        console.error(error);
      }
    })();
  }, []);

  return !user ? null : <>
    <Helmet>
      <title>Clothing-chain | Edit user</title>
      <meta name="description" content="Edit user"/>
    </Helmet>
    <Grid container className={classes.form}>
      <Grid item sm />
      <Grid item sm>
        <Typography variant="h3" className={classes.pageTitle}>
          {t("editUserDetails")}
        </Typography>

        <form onSubmit={handleSubmit(onSubmit)}>
          <TextFormField name="name" inputRef={register} />
          <TextFormField name="address" inputRef={register} />
          <TextFormField name="email" inputRef={register} />
          <PhoneFormField inputRef={register} />

          <Button
            type="submit"
            variant="contained"
            color="primary"
            className={classes.button}
          >
            {t("save")}
          </Button>
          <Button variant="contained" href={`/chains/members/${chainId}`}>
            {t("cancel")}
          </Button>
        </form>
      </Grid>
      <Grid item sm />
    </Grid>
  </>;
};

export default UserEdit;
