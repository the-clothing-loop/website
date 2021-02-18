import React, { Component } from "react";
import withStyles from "@material-ui/core/styles/withStyles";
import { Link } from "react-router-dom";

// Material UI
import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";
import CardMedia from "@material-ui/core/CardMedia";
import Typography from "@material-ui/core/Typography";

const styles = {
  card: {
    display: "flex",
  },
};
export class Chain extends Component {
  render() {
    const {
      classes,
      chain: { name, image, description },
    } = this.props;
    return (
      <Card>
        <CardMedia image={image} title="Image" />
        <CardContent>
          <Typography
            variant="h5"
            comonent={Link}
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
}

export default withStyles(styles)(Chain);
