import { useTranslation } from "react-i18next";

import { TextField, InputAdornment, Button, Paper } from "@mui/material";
import { Search } from "@mui/icons-material";
import { makeStyles } from "@mui/styles";

import CategoriesDropdown from "../CategoriesDropdown";
import SizesDropdown from "../SizesDropdown";

// Project resources
import theme from "../../util/theme";

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

  function handleSearchEnter(e: any) {
    if (e.key == "Enter") {
      handleSearch();
    }
  }

  return (
    <div className="tw-container tw-mx-auto">
      <Paper
        classes={{
          root: " tw-flex tw-shadow-none tw-p-4 lg:tw-px-20 tw-bg-white tw-flex-wrap lg:tw-flex-nowrap",
        }}
      >
        <label className="tw-flex lg:tw-w-auto lg:tw-flex-grow tw-h-12 lg:tw-mr-4 tw-border-solid tw-border tw-border-teal focus-within:tw-ring-2 tw-ring-inset tw-ring-yellow">
          <span className="block tw-self-center tw-px-2">
            <Search />
          </span>
          <input
            type="search"
            value={searchTerm}
            onChange={handleSearchTermChange}
            onKeyDown={handleSearchEnter}
            placeholder={t("searchLocation")}
            className="tw-w-full tw-border-0 tw-text-sm tw-outline-none tw-my-2 tw-mr-2"
          />
        </label>

        <div
          className={`tw-flex tw-flex-grow ${
            searchTerm.length > 0 ? "" : "tw-hidden md:tw-flex"
          }`}
        >
          <div className="tw-flex tw-w-2/3">
            <div className="tw-w-1/2  lg:tw-pr-4">
              <CategoriesDropdown
                variant="outlined"
                showInputLabel={false}
                renderValueWhenEmpty={t("categories")}
                genders={selectedGenders}
                handleSelectedCategoriesChange={handleSelectedGenderChange}
              />
            </div>

            <div className="tw-w-1/2  lg:tw-pr-4">
              <SizesDropdown
                variant="outlined"
                showInputLabel={false}
                label={t("sizes")}
                genders={selectedGenders}
                sizes={selectedSizes}
                handleSelectedCategoriesChange={setSelectedSizes}
              />
            </div>
          </div>

          <div className="tw-w-1/3">
            <Button
              className={classes.button + " tw-w-full tw-mx-0 tw-h-12"}
              variant="contained"
              color="primary"
              onClick={handleSearch}
            >
              {t("search")}
            </Button>
          </div>
        </div>
      </Paper>
    </div>
  );
};
