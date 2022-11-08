import {
  Box,
  Select,
  FormControl,
  MenuItem,
  SelectChangeEvent,
} from "@mui/material";
import { makeStyles } from "@mui/styles";

//project resources
import theme from "../util/theme";
import { useTranslation } from "react-i18next";

const LanguageSwitcher = () => {
  const languages = [
    { lng: "en", title: "English", flag: "/icons/flags/gb.svg" },
    { lng: "nl", title: "Dutch", flag: "/icons/flags/nl.svg" },
  ];
  const classes = makeStyles(theme as any)();
  const { i18n } = useTranslation();

  const handleChange = (e: SelectChangeEvent<string>) => {
    let language = e.target.value;
    i18n.changeLanguage(language);
  };

  return (
    <Box sx={{ paddingLeft: "18px" }}>
      <FormControl fullWidth>
        <Select<string>
          sx={{ textTransform: "unset" }}
          value={i18n.language}
          onChange={handleChange}
          className={classes.simpleSelect}
        >
          {languages.map((el, i) => {
            return (
              <MenuItem
                className={classes.menuItem}
                key={i}
                value={el.lng}
                disabled={el.lng === i18n.language}
                sx={{
                  "&::selection, &::-moz-selection": {
                    background: "white",
                  },
                  "&.Mui-disabled": {
                    display: "none",
                  },
                }}
              >
                {el.title}
                <img
                  style={{ marginLeft: "8px", width: "18px" }}
                  src={el.flag}
                  alt={el.title + " flag"}
                />
              </MenuItem>
            );
          })}
        </Select>
      </FormControl>
    </Box>
  );
};

export default LanguageSwitcher;
