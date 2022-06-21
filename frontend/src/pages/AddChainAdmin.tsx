import React from "react";
import {
  FormControl,
  Select,
  OutlinedInput,
  MenuItem,
  Typography,
  Button,
} from "@mui/material";
import { makeStyles } from "@mui/styles";

import RightArrow from "../images/right-arrow-white.svg";

import theme from "../util/theme";
import { addUserAsChainAdmin } from "../util/firebase/chain";

import { Title } from "../components/Typography";

export default function AddChainAdmin({ location }: { location: any }) {
  const classes = makeStyles(theme as any)();

  const { state } = location;
  const { users, chainId } = state;

  const [selectedUser, setSelectedUser] = React.useState<string>();

  const handleSelectedUserChange = (event: { target: any }) => {
    const { target } = event;
    const { value } = target;

    setSelectedUser(value);
  };

  const handleSubmitAddChainAdmin = async () => {
    if (selectedUser) {
      await addUserAsChainAdmin(chainId, selectedUser);
    }
  };

  return (
    <div className="tw-flex tw-flex-col tw-items-center tw-pt-24">
      <Title>Select Co-Host</Title>

      <div className="tw-mt-24 tw-w-[428px]">
        <FormControl classes={{ root: classes.specificSpacing }} fullWidth>
          <Select
            displayEmpty
            input={
              <OutlinedInput
                classes={{
                  root: classes.selectInputOutlined,
                }}
              />
            }
            classes={{
              select: classes.selectOutlined,
            }}
            variant="outlined"
            value={selectedUser}
            onChange={handleSelectedUserChange}
            renderValue={(selected: string) =>
              selected ?? (
                <Typography
                  component="span"
                  classes={{ root: classes.emptyRenderValue }}
                >
                  Select co-host
                </Typography>
              )
            }
          >
            {users.map(
              ({
                name,
                email,
                uid,
              }: {
                name: string;
                email: string;
                uid: string;
              }) => (
                <MenuItem
                  key={uid}
                  classes={{
                    root: classes.menuItemSpacingAndColor,
                    selected: classes.selected,
                  }}
                  value={uid}
                >
                  {name} - {email}
                </MenuItem>
              )
            )}
          </Select>
        </FormControl>
      </div>

      <div className="tw-mt-20">
        <Button
          className={classes.button}
          type="submit"
          variant="contained"
          color="primary"
          fullWidth
          onClick={handleSubmitAddChainAdmin}
        >
          Confirm
          <img src={RightArrow} />
        </Button>
      </div>
    </div>
  );
}
