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
  variant: "outlined" | "standard";
  showInputLabel: boolean;
  setSizes: (el: string[]) => void;
  genders: string[];
  sizes: string[];
  className: string;
  label: string;
  fullWidth: boolean;
}

const SizesDropdown: React.FC<IProps> = ({
  variant,
  showInputLabel,
  genders,
  setSizes,
  sizes,
  className,
  label,
  fullWidth,
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
    <FormControl classes={{ root: classes.specificSpacing }} fullWidth>
      {showInputLabel && (
        <InputLabel classes={{ root: classes.labelSelect }}>{label}</InputLabel>
      )}
      <Select
        className={stylingClass}
        inputProps={{
          className: classes.inputLabel,
        }}
        labelId="demo-multiple-checkbox-label"
        id="demo-multiple-checkbox"
        multiple
        displayEmpty
        variant={variant}
        value={selectedSizes}
        onChange={(e: any) => handleChange(e, setSelectedSizes)}
        renderValue={(selected: string[]) => {
          if (!selected.length) {
            return showInputLabel ? null : (
              <Typography
                component="span"
                classes={{ root: classes.emptyRenderValue }}
              >
                {label}
              </Typography>
            );
          } else {
            return selected.map(t).join(", ");
          }
        }}
      >
        <Typography component="p" className={classes.label}>
          {t("childrenSizes")}
        </Typography>{" "}
        {categories.children.map((value: any) => (
          <MenuItem
            key={value}
            disabled={
              !selectedGenders.includes("children") && !!selectedGenders.length
            }
            classes={{
              root: classes.menuItemSpacingAndColor,
              selected: classes.selected,
            }}
            value={value}
          >
            <Checkbox
              color="secondary"
              checked={selectedSizes.includes(value) ? true : false}
            />
            <ListItemText
              primary={t(value)}
              classes={{
                primary: classes.listItemTextFontSize,
              }}
            />
          </MenuItem>
        ))}
        <Typography component="p" className={classes.label}>
          {t("womenSizes")}
        </Typography>{" "}
        {categories.women.map((value: any) => (
          <MenuItem
            disabled={
              !selectedGenders.includes("women") && !!selectedGenders.length
            }
            classes={{
              root: classes.menuItemSpacingAndColor,
              selected: classes.selected,
            }}
            key={value}
            value={value}
          >
            <Checkbox
              color="secondary"
              checked={selectedSizes.includes(value) ? true : false}
            />
            <ListItemText
              primary={t(value)}
              classes={{
                primary: classes.listItemTextFontSize,
              }}
            />
          </MenuItem>
        ))}
        <Typography component="p" className={classes.label}>
          {t("menSizes")}
        </Typography>{" "}
        {categories.men.map((value: any) => (
          <MenuItem
            disabled={
              !selectedGenders.includes("men") && !!selectedGenders.length
            }
            classes={{
              root: classes.menuItemSpacingAndColor,
              selected: classes.selected,
            }}
            key={value}
            value={value}
          >
            <Checkbox
              color="secondary"
              checked={selectedSizes.includes(value) ? true : false}
            />
            <ListItemText
              primary={t(value)}
              classes={{
                primary: classes.listItemTextFontSize,
              }}
            />
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};
export default SizesDropdown;
