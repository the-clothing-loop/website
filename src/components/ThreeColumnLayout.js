import Grid from "@material-ui/core/Grid";
import { makeStyles } from "@material-ui/core";
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
