import { useTranslation } from "react-i18next";

import { TextField, InputAdornment, Button, Paper } from "@mui/material";
import { Search } from "@mui/icons-material";
import { makeStyles } from "@mui/styles";

import CategoriesDropdown from "../CategoriesDropdown";
import SizesDropdown from "../SizesDropdown";

// Project resources
import theme from "../../util/theme";
import { KeyboardEvent } from "react";

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

  function handleKeyUp(e: KeyboardEvent) {
    if (e.code === "Enter") {
      handleSearch();
    }
  }

  return (
    <Paper className={classes.root2}>
      <TextField
        id="outlined-basic"
        placeholder={t("searchLocation")}
        variant="outlined"
        className={classes.input}
        value={searchTerm}
        onChange={handleSearchTermChange}
        onKeyUp={handleKeyUp}
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

      <div className="search-bar__dropdown">
        <CategoriesDropdown
          variant="outlined"
          showInputLabel={false}
          renderValueWhenEmpty={t("categories")}
          genders={selectedGenders}
          handleSelectedCategoriesChange={handleSelectedGenderChange}
        />
      </div>

      <div className="search-bar__dropdown">
        <SizesDropdown
          variant="outlined"
          showInputLabel={false}
          label={t("sizes")}
          genders={selectedGenders}
          sizes={selectedSizes}
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
