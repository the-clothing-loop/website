import * as React from "react";
import { useTranslation } from "react-i18next";

//material ui
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
import { makeStyles, Typography } from "@material-ui/core";
import ListItemText from "@mui/material/ListItemText";
import Checkbox from "@mui/material/Checkbox";
import InputLabel from "@mui/material/InputLabel";

import theme from "../util/theme";
import categories from "../util/categories";

interface IProps {
  setGenders: (el: string[]) => void;
  genders: string[];
  className: string;
  fullWidth: boolean;
}

const CategoriesDropdown: React.FC<IProps> = ({
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
    <FormControl className={classes.sizesFormWrapper} fullWidth={fullWidth}>
      <InputLabel
        id="demo-multiple-checkbox-label"
        className={classes.labelSelect}
      >
        {t("categories")}
      </InputLabel>
      <Select
        className={stylingClass}
        labelId="demo-multiple-checkbox-label"
        id="demo-multiple-checkbox"
        multiple
        displayEmpty
        variant="standard"
        value={selectedGenders}
        onChange={(e: any) => handleChange(e, setSelectedGenders)}
        renderValue={(selected: string[]) => {
          if (selected.length === 0) {
            return (
              <em className={classes.em}>{t("no categories selected")}</em>
            );
          }

          return selected.map(t).join(", ");
        }}
      >
        {Object.keys(categories).map((value: string) => (
          <MenuItem key={value} value={value}>
            <Checkbox
              className={classes.checkbox}
              checked={selectedGenders.includes(value) ? true : false}
            />
            <ListItemText
              primary={t(value)}
              className={classes.listItemTextSizes}
              style={{ textTransform: "uppercase" }}
            />
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};
export default CategoriesDropdown;
