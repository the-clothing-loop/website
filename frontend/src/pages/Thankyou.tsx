// Material
import Grid from "@material-ui/core/Grid";
import { Helmet } from "react-helmet";

const Thankyou = () => {
  return <>
    <Helmet>
      <title>Clothing-chain | Thank you</title>
      <meta name="description" content="Thank you"/>
    </Helmet>
    <Grid container>
      <Grid item sm />
      <Grid item sm>
        <div>
          <h1>Submitted</h1>
          <p>Thank you!</p>
        </div>
      </Grid>
      <Grid item sm />
    </Grid>
  </>;
};

export default Thankyou;
