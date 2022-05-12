import { useTranslation } from "react-i18next";

import {
  MenuItem,
  FormControl,
  Select,
  ListItemText,
  Checkbox,
  TextField,
  InputAdornment,
  Button,
  Paper,
} from "@mui/material";
import { Search } from "@mui/icons-material";
import { makeStyles } from "@mui/styles";

import SizesDropdown from "../SizesDropdown";

// Project resources
import theme from "../../util/theme";
import categories from "../../util/categories";

interface IProps {
  searchTerm: string;
  handleSearchTermChange: React.ChangeEventHandler<HTMLInputElement>;
  selectedGenders: string[];
  handleSelectedGenderChange: any;
  selectedSizes: string[];
  setSelectedSizes: (el: string[]) => void;
  handleSearch: any;
}

export const SearchBar: React.FC<IProps> = ({
  searchTerm,
  handleSearchTermChange,
  selectedGenders,
  handleSelectedGenderChange,
  selectedSizes,
  setSelectedSizes,
  handleSearch,
}: IProps) => {
  const classes = makeStyles(theme as any)();

  const { t } = useTranslation();

  return (
    <Paper className={classes.root2}>
      <TextField
        id="outlined-basic"
        placeholder={t("searchLocation")}
        variant="outlined"
        className={classes.input}
        value={searchTerm}
        onChange={handleSearchTermChange}
        InputProps={{
          style: {
            color: "#48808B",
          },
          startAdornment: (
            <InputAdornment position="start" className={classes.inputAdornment}>
              <Search />
            </InputAdornment>
          ),
        }}
      />

      <FormControl className={classes.formControl}>
        <Select
          displayEmpty
          className={classes.select}
          labelId="demo-multiple-checkbox-label"
          id="demo-multiple-checkbox"
          multiple
          variant="outlined"
          value={selectedGenders}
          onChange={handleSelectedGenderChange}
          inputProps={{
            className: classes.specificSpacing,
          }}
          renderValue={(selected) => {
            if (Array.isArray(selected)) {
              if (selected.length === 0) {
                return <em className={classes.em}>{t("categories")}</em>;
              }

              return selected.map(t).join(", ");
            }
          }}
        >
          {Object.keys(categories).map((value: any) => (
            <MenuItem
              key={value}
              value={value}
              classes={{
                root: classes.menuItemSpacingAndColor,
                selected: classes.selected,
              }}
            >
              <Checkbox
                className={classes.checkbox}
                checked={selectedGenders.includes(value) ? true : false}
              />
              <ListItemText
                primary={t(value)}
                className={classes.listItemText}
                classes={{
                  primary: classes.listItemTextFontSize,
                }}
              />
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <div className={classes.formControl}>
        <SizesDropdown
          variant="outlined"
          showInputLabel={false}
          label={t("sizes")}
          selectedGenders={selectedGenders}
          selectedSizes={selectedSizes}
          handleSelectedCategoriesChange={setSelectedSizes}
        />
      </div>

      <Button
        className={classes.button}
        variant="contained"
        color="primary"
        onClick={handleSearch}
      >
        {t("search")}
      </Button>
    </Paper>
  );
};
