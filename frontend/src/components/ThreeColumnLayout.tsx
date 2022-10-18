import { ReactJSXElement } from "@emotion/react/types/jsx-namespace";
import { Grid } from "@mui/material";
import { makeStyles } from "@mui/styles";
import React from "react";

import theme from "../util/theme";

interface ThreeColumnLayoutProps {
  children: ReactJSXElement;
}
// Standard responsive three column grid used in the app
const ThreeColumnLayout = ({ children }: ThreeColumnLayoutProps) => {
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

export default ThreeColumnLayout;
