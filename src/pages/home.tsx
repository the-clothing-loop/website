import React, { Component } from "react";
import Grid from "@material-ui/core/Grid";
import { IChain } from "../types";
import Map from "../components/map.js";
import getChains from "../util/firebase/chain";
import { withTranslation } from "react-i18next";

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
    getChains().then((chains: Array<IChain>) => {
      this.setState({
        chains,
      });
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

export default withTranslation()(Home);
