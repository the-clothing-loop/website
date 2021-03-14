import React, { Component } from "react";
import withStyles from "@material-ui/core/styles/withStyles";
import PropTypes from "prop-types";
import AppIcon from "../images/sfm_logo.png";
import axios from "axios";

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

  handleSubmit = (event) => {
    event.preventDefault();
    this.setState({
      loading: true,
    });

    const newUserData = {
      email: this.state.email,
      address: this.state.address,
      name: this.state.name,
      phoneNumber: this.state.phoneNumber,
    };

    console.log(newUserData);
    
    axios
      .post("/signup", newUserData)
      .then((res) => {
        console.log(res.data);
        localStorage.setItem("FBIdToken", `Bearer ${res.data.token}`);
        this.setState({
          loading: false,
        });
        this.props.history.push("/");
      })
      .catch((err) => {
        console.log(err);
        this.setState({
          errors: err.response.data,
          loading: false,
        });
      });
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
            Sign up
          </Typography>
          <form noValidate onSubmit={this.handleSubmit}>
            {chainsMarkup}
            <TextField
              id="name"
              name="name"
              type="text"
              label="Name"
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
              label="Address"
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
              label="Email"
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
              label="Phone number"
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
                label="Actions"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={this.state.checkedNewsletter}
                    onChange={this.handlechecked}
                    name="checkedNewsletter"
                  />
                }
                label="Newsletter"
              />
            </FormGroup>

            <Button
              type="submit"
              variant="contained"
              color="primary"
              className={classes.button}
            >
              Sign up
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

export default withStyles(styles)(signup);
