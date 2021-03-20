import React, { Component } from "react";
import Grid from "@material-ui/core/Grid";
import Chain from "../components/Chain";
import db from "../util/firebase";
import { IChain } from "../types";
import Map from "../components/map.js";

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
      })
      .catch((error: any) => {
        console.error("Error getting chains: ", error);
      });
  }

  render() {
    return (
      <Grid container>
        <Map />
      </Grid>
    );
  }
}

export default Home;
