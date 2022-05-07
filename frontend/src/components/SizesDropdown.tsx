import * as React from "react";
import { useTranslation } from "react-i18next";

import {
  MenuItem,
  FormControl,
  Select,
  ListItemText,
  Checkbox,
  Typography,
  InputLabel,
} from "@mui/material";
import { makeStyles } from "@mui/styles";

import theme from "../util/theme";
import categories from "../util/categories";

interface IProps {
  setSizes: (el: string[]) => void;
  genders: string[];
  sizes: string[];
  className: string;
  label: string;
  fullWidth: boolean;
  inputVisible: boolean;
  variantVal: boolean;
}

const SizesDropdown: React.FC<IProps> = ({
  genders,
  setSizes,
  sizes,
  className,
  label,
  fullWidth,
  inputVisible,
  variantVal,
}: IProps) => {
  const classes = makeStyles(theme as any)();
  const { t } = useTranslation();

  const selectedGenders = genders;
  const setSelectedSizes = setSizes;
  const selectedSizes = sizes;
  const stylingClass = className;

  //get selected categories
  const handleChange = (event: any, setCategories: any) => {
    const {
      target: { value },
    } = event;

    setCategories(typeof value === "string" ? value.split(",") : value);
  };

  return (
    <FormControl
      className={classes.sizesFormWrapper}
      fullWidth={fullWidth}
      classes={{ root: classes.specificSpacing }}
    >
      {inputVisible ? (
        <InputLabel
          id="demo-multiple-checkbox-label"
          className={classes.labelSelect}
        >
          {label}
        </InputLabel>
      ) : null}
      <Select
        className={stylingClass}
        inputProps={{
          className: classes.inputLabel,
        }}
        labelId="demo-multiple-checkbox-label"
        id="demo-multiple-checkbox"
        multiple
        displayEmpty
        variant={variantVal ? "standard" : "outlined"}
        value={selectedSizes}
        onChange={(e: any) => handleChange(e, setSelectedSizes)}
        renderValue={(selected: string[]) => {
          if (selected.length === 0 && !inputVisible) {
            return <em className={classes.em}>{label}</em>;
          }

          if (selected.length === 0 && inputVisible) {
            return;
          }

          return selected.map(t).join(", ");
        }}
      >
        <Typography component="p" className={classes.label}>
          {t("childrenSizes")}
        </Typography>{" "}
        {categories.children.map((value: any) => (
          <MenuItem
            key={value}
            disabled={
              !selectedGenders.includes("children") &&
              selectedGenders.length !== 0
            }
            classes={{
              root: classes.menuItemSpacingAndColor,
              selected: classes.selected,
            }}
            value={value}
          >
            <Checkbox
              className={classes.checkbox}
              checked={selectedSizes.includes(value) ? true : false}
            />
            <ListItemText
              primary={t(value)}
              className={classes.listItemTextSizes}
              style={{ textTransform: "capitalize" }}
            />
          </MenuItem>
        ))}
        <Typography component="p" className={classes.label}>
          {t("womenSizes")}
        </Typography>{" "}
        {categories.women.map((value: any) => (
          <MenuItem
            disabled={
              !selectedGenders.includes("women") && selectedGenders.length !== 0
            }
            classes={{
              root: classes.menuItemSpacingAndColor,
              selected: classes.selected,
            }}
            key={value}
            value={value}
          >
            <Checkbox
              className={classes.checkbox}
              checked={selectedSizes.includes(value) ? true : false}
            />
            <ListItemText
              primary={t(value)}
              className={classes.listItemTextSizes}
              style={{ textTransform: "capitalize" }}
            />
          </MenuItem>
        ))}
        <Typography component="p" className={classes.label}>
          {t("menSizes")}
        </Typography>{" "}
        {categories.men.map((value: any) => (
          <MenuItem
            disabled={
              !selectedGenders.includes("men") && selectedGenders.length !== 0
            }
            classes={{
              root: classes.menuItemSpacingAndColor,
              selected: classes.selected,
            }}
            key={value}
            value={value}
          >
            <Checkbox
              className={classes.checkbox}
              checked={selectedSizes.includes(value) ? true : false}
            />
            <ListItemText
              primary={t(value)}
              className={classes.listItemTextSizes}
              style={{ textTransform: "capitalize" }}
            />
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};
export default SizesDropdown;
