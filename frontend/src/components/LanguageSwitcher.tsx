import { Select, FormControl, MenuItem, SelectChangeEvent } from "@mui/material";
import { makeStyles } from "@mui/styles";

//project resources
import theme from "../util/theme";
import { useTranslation } from "react-i18next";

const LanguageSwitcher = () => {
  const languages = [
    {lng: "en", title: "English 🇬🇧"}, 
    {lng: "nl", title: "Dutch 🇳🇱"},
  ];
  const classes = makeStyles(theme as any)();
  const { i18n } = useTranslation();

  const handleChange = (e: SelectChangeEvent<string>) => {
    let language = e.target.value;
    i18n.changeLanguage(language);
  };

  return (
    <div className={classes.languageSwitcherWrapper}>
      <FormControl fullWidth>
        <Select<string>
          labelId="language-switcher-select-label"
          id="language-switcher-select"
          value={i18n.language}
          onChange={handleChange}
          className={classes.simpleSelect}
          variant="outlined"
        >
          {languages.map((el, i) => {
            return (
              <MenuItem
                className={classes.menuItem}
                key={i}
                value={el.lng}
                disabled={el.lng === i18n.language}
              >
                {el.title}
              </MenuItem>
            );
          })}
        </Select>
      </FormControl>
    </div>
  );
};

export default LanguageSwitcher;
