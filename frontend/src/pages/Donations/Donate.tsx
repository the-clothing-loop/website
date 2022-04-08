// Material
import { makeStyles } from "@material-ui/core";
import DonationForm from "../../components/Donation/DonationForm";
import DonationCompleted from "../../components/Donation/DonationCompleted";

//Project resources
import theme from "../../util/theme";
import { RouteComponentProps } from "react-router";
import { Helmet } from "react-helmet";

type TParams = {
  status?: string;
};

const Donate = ({ match }: RouteComponentProps<TParams>) => {
  const classes = makeStyles(theme as any)();
  const params = match.params;
  const { status } = params;

  return (
    <>
      <Helmet>
        <title>The Clothing Loop | Donate</title>
        <meta name="description" content="Donate" />
      </Helmet>
      <div>
        {status === "thankyou" ? <DonationCompleted /> : <DonationForm />}
      </div>
    </>
  );
};

export default Donate;
