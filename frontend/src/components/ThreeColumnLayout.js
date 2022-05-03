import { Grid } from "@mui/material";
import { makeStyles } from "@mui/styles";

import theme from "../util/theme";

// Standard responsive three column grid used in the app
const ThreeColumnLayout = ({ children }) => {
  const classes = makeStyles(theme)();

  return (
    <Grid container className={classes.form}>
      <Grid item sm />
      <Grid item sm>
        {children}
      </Grid>
      <Grid item sm />
    </Grid>
  );
};

export default ThreeColumnLayout;
