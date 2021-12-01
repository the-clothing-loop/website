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
    <div className="language-switcher-wrapper">
      {languages ? (
        <FormControl fullWidth>
          <Select
            labelId="simple-select-label"
            id="simple-select"
            value={selected}
            label="Languages"
            onChange={handleChange}
            className={classes.simpleSelect}
          >
            {languages.map((el, i) => {
              return (
                <MenuItem className={classes.menuItem} key={i} value={el}>
                  {el}
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
