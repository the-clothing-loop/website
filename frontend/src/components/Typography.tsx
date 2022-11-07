import { Typography } from "@mui/material";
import { makeStyles } from "@mui/styles";

import theme from "../util/theme";

const useStyles = makeStyles(theme as any);

export const Title = ({ children }: { children: any }) => {
  const classes = useStyles();

  return (
    <Typography classes={{ root: "tw-font-bold tw-text-4xl tw-uppercase" }}>
      {children}
    </Typography>
  );
};
