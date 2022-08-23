import { Typography } from "@mui/material";
import { makeStyles } from "@mui/styles";

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
