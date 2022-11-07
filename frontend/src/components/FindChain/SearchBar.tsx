import { KeyboardEvent } from "react";
import { useTranslation } from "react-i18next";
import categories from "../../util/categories";

import CategoriesDropdown from "../CategoriesDropdown";
import SizesDropdown from "../SizesDropdown";

interface IProps {
  searchTerm: string;
  handleSearchTermChange: React.ChangeEventHandler<HTMLInputElement>;
  selectedGenders: string[];
  handleSelectedGenderChange: (g: string[]) => void;
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
  const { t } = useTranslation();

  function handleSearchEnter(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key == "Enter") {
      handleSearch();
    }
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        handleSearch();
      }}
      className="tw-container tw-mx-auto  tw-flex tw-shadow-none tw-p-4 lg:tw-px-20 tw-bg-white tw-flex-wrap lg:tw-flex-nowrap"
    >
      <label className="tw-flex lg:tw-w-auto lg:tw-flex-grow tw-h-12 lg:tw-mr-4 tw-input tw-input-bordered tw-input-secondary focus-within:tw-outline-2 focus-within:tw-outline focus-within:tw-outline-secondary focus-within:tw-outline-offset-2">
        <span className="block tw-self-center tw-pr-3 feather feather-search"></span>
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
        <div className="tw-flex">
          <div className="tw-w-48 lg:tw-pr-4">
            <CategoriesDropdown
              selectedGenders={selectedGenders}
              handleChange={handleSelectedGenderChange}
            />
          </div>

          <div className="tw-w-48 lg:tw-pr-4">
            <SizesDropdown
              filteredGenders={
                selectedGenders.length
                  ? selectedGenders
                  : Object.keys(categories)
              }
              selectedSizes={selectedSizes}
              handleChange={setSelectedSizes}
            />
          </div>
        </div>

        <div className="tw-w-1/3">
          <button
            type="submit"
            className=" tw-w-full tw-mx-0 tw-h-12 tw-btn tw-btn-primary"
          >
            {t("search")}
          </button>
        </div>
      </div>
    </form>
  );
};
