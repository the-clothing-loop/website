// Material
import Grid from "@material-ui/core/Grid";
import { Helmet } from "react-helmet";

//Project resources
import AppIcon from "../images/clothing-loop.png";

const Thankyou = () => {
  return (
    <>
      <Helmet>
        <title>Clothing-Loop | Thank you</title>
        <meta name="description" content="Thank you" />
      </Helmet>
      <Grid container>
        <Grid item sm />
        <Grid item sm>
          <div>
            <img src={AppIcon} alt="SFM logo" width="500" />
            <h1>Your request has been successfully submitted!</h1>
            <p>You will shortly receive an email confirmation.</p>
          </div>
        </Grid>
        <Grid item sm />
      </Grid>
    </>
  );
};

export default Thankyou;
