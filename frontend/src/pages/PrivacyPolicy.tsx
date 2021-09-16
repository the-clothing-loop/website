import { Typography } from "@material-ui/core";

import { makeStyles } from "@material-ui/core";

const PrivacyPolicy = () => {
  const useStyles = makeStyles({
    privacyStatement: {
      padding: '1% 20% 20%'
    },
  });
  const classes = useStyles()

  return (
    <>
      <Typography component="p" className={classes.privacyStatement}>
        We are buying more and more garments and wearing them shorter and
        shorter. The Clothing Loop tackles this growing problem – while
        connecting people in the neighborhood in a fun and sustainable
        way. The idea of the Clothing Loop is simple: (large) bags filled
        with clothing travel a route past all participants in a particular
        city or neighborhood. Do you receive the bag at home? Then you can
        take out what you like and put back something that is still in
        good condition, but ready for a new owner. If you want, you can
        share a photo with your new addition in the corresponding WhatsApp
        group. Then you take the bag to the next neighbor on the list. We
        started a year ago in Amsterdam in the Netherlands as a
        corona-proof, local alternative for clothing swap events and now
        have more than 7500 participants spread over more than 210 chains
        across the country. The success has now been picked up by numerous
        (national) media (see for example: NOS). Our goal is to spread
        this initiative globally. To this end, we are building an online
        platform where anyone, anywhere can start or join a chain.
      </Typography>
    </>
  );
};

export default PrivacyPolicy;