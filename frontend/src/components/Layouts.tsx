import Grid from "@material-ui/core/Grid";
import { makeStyles } from "@material-ui/core";
import theme from "../util/theme";

interface ITwoColumnsLayout {
  children: any;
  img: any;
}

interface IThreeColumnsLayout {
  children: any;
}

// Standard responsive three column grid used in the app
const ThreeColumnLayout: React.FC<IThreeColumnsLayout> = ({ children }) => {
  const classes = makeStyles(theme as any)();

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

const TwoColumnLayout: React.FC<ITwoColumnsLayout> = ({ children, img }) => {
  const classes = makeStyles(theme as any)();

  return (
    <div className={classes.formContainer}>
      <Grid container className={classes.form}>
        <Grid item sm>
          <img src={img} />
        </Grid>
        <Grid item sm>
          {children}
        </Grid>
      </Grid>
    </div>
  );
};

export { ThreeColumnLayout, TwoColumnLayout };
