import React from "react";
import {
  makeStyles,
  Button,
  TextField,
  Typography,
  Grid,
} from "@material-ui/core";

import ArrowRight from "./arrow-right.svg";

import { subscribeToNewsletter } from "../../util/firebase/newsletter";

const useStyles = makeStyles({
  headingTypographyRoot: {
    fontFamily: "Playfair Display",
    fontStyle: "normal",
    fontWeight: "bold",
    fontSize: "48px",
    lineHeight: "64px",
    color: "#48808B",
  },
  subheadingTypographyRoot: {
    marginTop: "16px",
    fontFamily: "Avenir", // Not a free font. Available by default in MacOS
    fontWeight: "normal",
    fontSize: "18px",
    lineHeight: "25px",
    color: "#3C3C3B",
  },
  textFieldGridRoot: {
    marginTop: "8px",
  },
  muiInputLabelRootTextFieldRoot: {
    "& label.MuiInputLabel-root": { color: "#48808B" },
    "& .MuiInputBase-input": { color: "#48808B" },
    "& .MuiInput-underline": {
      "&:after": { borderBottom: "none" },
    },
  },
  buttonRoot: {
    marginTop: "24px",
    fontFamily: "Avenir", // Not a free font. Available by default in MacOS
    fontSize: "16px",
    fontWeight: 500,
    padding: "12px 32px",
    borderRadius: "0px",
    background: "#f7C86f",
    color: "#ffffff",
    textTransform: "capitalize",
    "&:hover": {
      background: "#f7a00f", // Change color, not part of Figma
    },
  },
});

export const Newsletter = () => {
  const classes = useStyles();

  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value);
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
  };

  const handleSubmitClick = async () => {
    await subscribeToNewsletter({ name, email });
  };

  return (
    <div className="newsletter">
      <Typography classes={{ root: classes.headingTypographyRoot }}>
        Keep up with our latest news
      </Typography>
      <Typography classes={{ root: classes.subheadingTypographyRoot }}>
        Stay on top of our latest news and releases about the clothing loop
      </Typography>
      <Grid
        container
        classes={{ root: classes.textFieldGridRoot }}
        spacing={4}
        wrap="nowrap"
      >
        <Grid item id="mobile-textfield">
          <TextField
            classes={{
              root: classes.muiInputLabelRootTextFieldRoot,
            }}
            label="Name"
            value={name}
            onChange={handleNameChange}
          />
        </Grid>
        <Grid item id="mobile-textfield">
          <TextField
            classes={{
              root: classes.muiInputLabelRootTextFieldRoot,
            }}
            type="email"
            label="Email address"
            value={email}
            onChange={handleEmailChange}
          />
        </Grid>
      </Grid>
      <Button
        classes={{ root: classes.buttonRoot }}
        onClick={handleSubmitClick}
        id="mobile-submit-bt"
      >
        <Grid container spacing={3}>
          <Grid item id="btn-text">
            Submit
          </Grid>
          <Grid item>
            <img src={ArrowRight} />
          </Grid>
        </Grid>
      </Button>
    </div>
  );
};
