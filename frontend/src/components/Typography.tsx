import { makeStyles } from "@material-ui/styles";
import { Typography } from "@material-ui/core";

import theme from "../util/theme";

const useStyles = makeStyles(theme as any);

export const Title = ({ children }: { children: any }) => {
  const classes = useStyles();

  return (
    <Typography classes={{ root: classes.titleTypographyRoot }}>
      {children}
    </Typography>
  );
};
