import React, { Component } from "react";
import Grid from "@material-ui/core/Grid";
import Chain from "../components/Chain";
import db from "../util/firebase";

class home extends Component {
  state = {
    chains: null,
  };

  componentDidMount() {
    db.collection("chains")
      .get()
      .then((snapshot) => {
        const chains = snapshot.docs.map((x) => x.data());
        this.setState({
          chains,
        });
      })
      .catch((error) => {
        console.error("Error getting chains: ", error);
      });
  }

  render() {
    let chainsMarkup = this.state.chains ? (
      this.state.chains.map((chain) => <Chain chain={chain} />)
    ) : (
      <p>Loading...</p>
    );
    return (
      <Grid container>
        <Grid item sm={8} xs={12}>
          {chainsMarkup}
        </Grid>
      </Grid>
    );
  }
}

export default home;
