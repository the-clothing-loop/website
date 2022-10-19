import { useContext, useState } from "react";
import { Helmet } from "react-helmet";
import { Redirect, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { Typography } from "@mui/material";
import { makeStyles } from "@mui/styles";

import theme from "../util/theme";
import ProgressBar from "../components/ProgressBar";
import ChainDetailsForm, {
  RegisterChainForm,
} from "../components/ChainDetailsForm";
import {
  registerChainAdmin,
  RequestRegisterChain,
  RequestRegisterUser,
} from "../api/login";
import { AuthContext } from "../providers/AuthProvider";
import { chainAddUser, chainCreate } from "../api/chain";

export interface State {
  only_create_chain: boolean;
  register_user?: RequestRegisterUser;
}

const NewChainLocation = ({ location }: { location: any }) => {
  const classes = makeStyles(theme as any)();
  const { t } = useTranslation();

  const state = location.state as State;
  const authUser = useContext(AuthContext).authUser;

  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState<boolean>(false);

  const onSubmit = async (values: RegisterChainForm) => {
    let user = state.only_create_chain ? authUser : state.register_user;
    if (!user) {
      setError("User is not availible");
      return;
    }
    const newChain: RequestRegisterChain = {
      ...values,
      address: user!.address,
      open_to_new_members: true,
      longitude: values.longitude,
      latitude: values.latitude,
    };

    console.log(`creating chain: ${JSON.stringify(newChain)}`);
    if (state.only_create_chain) {
      try {
        await chainCreate(newChain);
        setSubmitted(true);
      } catch (e: any) {
        console.error(`Error creating chain: ${JSON.stringify(e)}`);
        setError(e?.data || `Error: ${JSON.stringify(e)}`);
      }
    } else {
      console.log(`creating user: ${JSON.stringify(user)}`);
      try {
        await registerChainAdmin(
          {
            name: user.name,
            email: user.email,
            address: user.address,
            phone_number: user.phone_number,
            newsletter: state.register_user?.newsletter || false,
            sizes: user.sizes,
          },
          newChain
        );
        setSubmitted(true);
      } catch (e: any) {
        console.error(`Error creating user and chain: ${JSON.stringify(e)}`);
        setError(e?.data || `Error: ${JSON.stringify(e)}`);
      }
    }

    await newChain;
  };

  if (submitted) {
    return <Redirect to={`/loops/new/confirmation`} />;
  }

  return (
    <>
      <Helmet>
        <title>The Clothing Loop | Create New Loop</title>
        <meta name="description" content="Create New Loop" />
      </Helmet>
      <div className={classes.formContainerLocation}>
        <div className={classes.newLoopLocationForm}>
          <Typography
            variant="h3"
            className={classes.pageTitle}
            style={{ textAlign: "center" }}
          >
            {t("startNewLoop")}
          </Typography>
          <div className={classes.progressBarWrapper}>
            <ProgressBar activeStep={1} />
          </div>
          <ChainDetailsForm onSubmit={onSubmit} submitError={error} />
        </div>
      </div>
    </>
  );
};

export default NewChainLocation;
