import React, { Component } from "react";
import { withTranslation } from "react-i18next";

// Material UI
import Grid from "@material-ui/core/Grid";

// Project resources
import Map from "../components/Map.js";
import { IChain } from "../types";
import { getChains } from "../util/firebase/chain";

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
