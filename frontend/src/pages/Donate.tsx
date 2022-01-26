// Material
import { makeStyles, Typography } from "@material-ui/core";
import DonationForm from "../components/Donation/DonationForm";

//Project resources
import theme from "../util/theme";
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
        <title>Clothing-Loop | Donate</title>
        <meta name="description" content="Donate" />
      </Helmet>
      <div className={classes.donationsWrapper}>
        <div>
          <Typography className={classes.pageTitle}>
            Donate to The Clothing Loop
          </Typography>

          {status === "thankyou" ? <>Thank you</> : <DonationForm />}
        </div>
      </div>
    </>
  );
};

export default Donate;
