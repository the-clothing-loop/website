import { useContext, useState } from "react";
import { Helmet } from "react-helmet";
import { Redirect, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";

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
import { chainCreate } from "../api/chain";

export interface State {
  only_create_chain: boolean;
  register_user?: RequestRegisterUser;
}

const NewChainLocation = ({ location }: { location: any }) => {
  const { t } = useTranslation();

  const state = location.state as State;
  const { authUser, authUserRefresh } = useContext(AuthContext);

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
        await authUserRefresh();
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
    return <Redirect to="/loops/new/confirmation" />;
  }

  return (
    <>
      <Helmet>
        <title>The Clothing Loop | Create New Loop</title>
        <meta name="description" content="Create New Loop" />
      </Helmet>
      <main className="container lg:max-w-screen-lg mx-auto px-1 md:px-20 pt-4">
        <div className="bg-teal-light p-8">
          <h1 className="text-center font-medium text-secondary text-5xl mb-6">
            {t("startNewLoop")}
          </h1>
          <div className="text-center mb-6">
            <ProgressBar activeStep={1} />
          </div>
          <ChainDetailsForm onSubmit={onSubmit} submitError={error} />
        </div>
      </main>
    </>
  );
};

export default NewChainLocation;
