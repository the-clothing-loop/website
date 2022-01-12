import i18n from "../i18n";
import { useState } from "react";

//material UI
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
import { makeStyles } from "@material-ui/core";

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
