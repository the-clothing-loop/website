import { Link } from "react-router-dom";

// Material UI
import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";
import CardMedia from "@material-ui/core/CardMedia";
import Typography from "@material-ui/core/Typography";
import withStyles from "@material-ui/core/styles/withStyles";

// Project resources
import { IChain } from "../types";

const styles = {
  card: {
    display: "flex",
  },
};

interface IChainProps {
  chain: IChain;
}

const Chain = (props: IChainProps) => {
  const { name, description, image} = props.chain;
  return (
    <Card>
      <CardMedia image={image} title="Image" />
      <CardContent>
        <Typography
          variant="h5"
          component={Link}
          to={`/chains/${name}`}
          color="primary"
        >
          {name}
        </Typography>
        <Typography variant="body1">{description}</Typography>
      </CardContent>
    </Card>
  );
}

export default withStyles(styles)(Chain);
