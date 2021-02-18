import React, { Component } from "react";
import Grid from "@material-ui/core/Grid";
import axios from "axios";
import Chain from "../components/Chain"

class home extends Component {
  state = {
    chains: null,
  };

  componentDidMount() {
    axios
      .get("/chains")
      .then((res) => {
        console.log(res.data);
        this.setState({
          chains: res.data,
        });
      })
      .catch((err) => console.log(err));
  }

  render() {
    let chainsMarkup = this.state.chains ? (
      this.state.chains.map(chain => <Chain chain={chain}/>)
    ) : <p>Loading...</p>
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
