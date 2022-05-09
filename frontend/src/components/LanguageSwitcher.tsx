import i18n from "../i18n";
import { useState } from "react";

import { Select, FormControl, MenuItem } from "@mui/material";
import { makeStyles } from "@mui/styles";

//project resources
import theme from "../util/theme";

const LanguageSwitcher = () => {
  const languages = ["en", "nl"];
  const classes = makeStyles(theme as any)();

  const [selected, setSelected] = useState("en");

  const handleChange = (e: any) => {
    let language = e.target.value;
    i18n.changeLanguage(language);
    setSelected(language);
  };

  return (
    <div className={classes.languageSwitcherWrapper}>
      {languages ? (
        <FormControl fullWidth>
          <Select
            labelId="language-switcher-select-label"
            id="language-switcher-select"
            value={selected}
            onChange={handleChange}
            className={classes.simpleSelect}
            variant="outlined"
          >
            {languages.map((el, i) => {
              return (
                <MenuItem className={classes.menuItem} key={i} value={el}>
                  {el === "en" ? "English 🇬🇧" : "Dutch 🇳🇱"}
                </MenuItem>
              );
            })}
          </Select>
        </FormControl>
      ) : null}
    </div>
  );
};

export default LanguageSwitcher;
