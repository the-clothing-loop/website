import React, { Component } from "react";
import Grid from "@material-ui/core/Grid";
import Chain from "../components/Chain";
import db from "../util/firebase";
import { IChain } from "../types";
import Map from "../util/map.js";

interface IHomeState {
  chains: IChain[] | null;
}

class Home extends Component<{}, IHomeState> {
  constructor(props: {}) {
    super(props);
    this.state = {
      chains: null,
    };
  }

  componentDidMount() {
    db.collection("chains")
      .get()
      .then((snapshot: any) => {
        const chains = snapshot.docs.map((x: any) => x.data() as IChain);
        this.setState({
          chains,
        });
        console.log(chains);
      })
      .catch((error: any) => {
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
        <Map />
      </Grid>
    );
  }
}

export default Home;
