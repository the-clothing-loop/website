import * as React from "react";
import { useTranslation } from "react-i18next";

import {
  InputLabel,
  Checkbox,
  ListItemText,
  Select,
  FormControl,
  MenuItem,
  Typography,
} from "@mui/material";
import { makeStyles } from "@mui/styles";

import theme from "../util/theme";
import categories from "../util/categories";

interface IProps {
  variant: "outlined" | "standard";
  renderValueWhenEmpty?: string;
  setGenders: (el: string[]) => void;
  genders: string[];
  className: string;
  fullWidth: boolean;
}

const CategoriesDropdown: React.FC<IProps> = ({
  variant,
  renderValueWhenEmpty,
  genders,
  setGenders,
  className,
  fullWidth,
}: IProps) => {
  const classes = makeStyles(theme as any)();
  const { t } = useTranslation();

  const selectedGenders = genders;
  const setSelectedGenders = setGenders;
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
      <InputLabel
        id="demo-multiple-checkbox-label"
        className={classes.labelSelect}
        classes={{ root: classes.focusColor }}
      >
        {t("categories")}
      </InputLabel>
      <Select
        className={stylingClass}
        labelId="demo-multiple-checkbox-label"
        id="demo-multiple-checkbox"
        multiple
        displayEmpty
        variant={variant}
        value={selectedGenders}
        onChange={(e: any) => handleChange(e, setSelectedGenders)}
        renderValue={(selected: string[]) =>
          !selected.length && renderValueWhenEmpty ? (
            <Typography
              component="span"
              classes={{ root: classes.emptyRenderValue }}
            >
              {renderValueWhenEmpty}
            </Typography>
          ) : (
            selected.map(t).join(", ")
          )
        }
      >
        {Object.keys(categories).map((value: string) => (
          <MenuItem
            key={value}
            value={value}
            classes={{
              root: classes.menuItemSpacingAndColor,
              selected: classes.selected,
            }}
          >
            <Checkbox
              color="secondary"
              checked={selectedGenders.includes(value) ? true : false}
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
export default CategoriesDropdown;
