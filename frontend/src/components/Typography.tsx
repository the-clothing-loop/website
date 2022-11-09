import { makeStyles } from "@mui/styles";

import theme from "../util/theme";

const useStyles = makeStyles(theme as any);

export const Title = ({ children }: { children: any }) => {
  const classes = useStyles();

  return <p className="tw-font-bold tw-text-4xl tw-uppercase">{children}</p>;
};
