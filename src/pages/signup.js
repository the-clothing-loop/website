import React, { Component } from "react";
import withStyles from "@material-ui/core/styles/withStyles";
import PropTypes from "prop-types";
import AppIcon from "../images/sfm_logo.png";

import { withTranslation } from 'react-i18next';

// Material
import Grid from "@material-ui/core/Grid";
import Typography from "@material-ui/core/Typography";
import TextField from "@material-ui/core/TextField";
import Button from "@material-ui/core/Button";
import Checkbox from "@material-ui/core/Checkbox";
import FormGroup from "@material-ui/core/FormGroup";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Input from "@material-ui/core/Input";
import Select from "@material-ui/core/Select";
import MenuItem from "@material-ui/core/MenuItem";

import getChains from "../util/firebase/chain";
import addUser from "../util/firebase/user";

const styles = (theme) => ({
  ...theme.spreadThis,
});

class signup extends Component {
  constructor() {
    super();
    this.state = {
      email: "",
      loading: false,
      errors: {},
    };
  }

  componentDidMount() {
    getChains().then((chains) => {
      this.setState({
        chains,
      });
    });
  }

  handleSubmit = (event) => {
    event.preventDefault();
    this.setState({
      loading: true,
    });

    const newUser = {
      email: this.state.email,
      address: this.state.address,
      name: this.state.name,
      phoneNumber: this.state.phoneNumber,
    };

    addUser(newUser);
  };

  handleChange = (event) => {
    this.setState({
      [event.target.name]: event.target.value,
    });
  };

  handleCheck = (event) => {
    this.setState({
      [event.target.checked]: event.target.checked,
    });
  };

  render() {
    const { classes } = this.props;
    const { errors } = this.state;

    let chainsMarkup = this.state.chains ? (
      <Select
        id="selectChain"
        value={this.state.chains[0].name}
        onChange={this.handleChange}
        input={<Input />}
      >
        {this.state.chains.map((chain) => (
          <MenuItem key={chain.name} value={chain.name}>
            {chain.name}
          </MenuItem>
        ))}
      </Select>
    ) : (
      <p>Loading...</p>
    );

    return (
      <Grid container className={classes.form}>
        <Grid item sm />
        <Grid item sm>
          <img
            src={AppIcon}
            alt="SFM logo"
            width="200"
            className={classes.image}
          />
          <Typography variant="h3" className={classes.pageTitle}>
            { this.props.t("signup") }
          </Typography>
          <form noValidate onSubmit={this.handleSubmit}>
            {chainsMarkup}
            <TextField
              id="name"
              name="name"
              type="text"
              label={this.props.t("name")}
              className={classes.textField}
              helperText={errors.name}
              error={errors.name ? true : false}
              value={this.state.name}
              onChange={this.handleChange}
              fullWidth
            ></TextField>
            <TextField
              id="address"
              name="address"
              type="text"
              label={this.props.t("address")}
              className={classes.textField}
              helperText={errors.address}
              error={errors.address ? true : false}
              value={this.state.address}
              onChange={this.handleChange}
              fullWidth
            ></TextField>
            <TextField
              id="email"
              name="email"
              type="email"
              label={this.props.t("email")}
              className={classes.textField}
              helperText={errors.email}
              error={errors.email ? true : false}
              value={this.state.email}
              onChange={this.handleChange}
              fullWidth
            ></TextField>
            <TextField
              id="phoneNumber"
              name="phoneNumber"
              type="tel"
              label={this.props.t("phonenumber")}
              className={classes.textField}
              helperText={errors.phoneNumber}
              error={errors.phoneNumber ? true : false}
              value={this.state.phoneNumber}
              onChange={this.handleChange}
              fullWidth
            ></TextField>

            <FormGroup row>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={this.state.checkedActions}
                    onChange={this.handlechecked}
                    name="checkedActions"
                  />
                }
                label={this.props.t("actions")}
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={this.state.checkedNewsletter}
                    onChange={this.handlechecked}
                    name="checkedNewsletter"
                  />
                }
                label={this.props.t("newsletter")}
              />
            </FormGroup>

            <Button
              type="submit"
              variant="contained"
              color="primary"
              className={classes.button}
            >
              {this.props.t("signup")}
            </Button>
          </form>
        </Grid>
        <Grid item sm />
      </Grid>
    );
  }
}

signup.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withTranslation()(withStyles(styles)(signup));
