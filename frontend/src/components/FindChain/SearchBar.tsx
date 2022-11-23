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
    if (e.key === "Enter") {
      handleSearch();
    }
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        handleSearch();
      }}
      className="container mx-auto flex p-4 lg:px-1 md:px-20 bg-white flex-wrap sm:flex-nowrap flex-col md:flex-row"
    >
      <label className="flex lg:w-auto md:flex-grow h-12 md:mr-4 mb-4 md:mb-0 input input-bordered input-secondary focus-within:outline-2 focus-within:outline focus-within:outline-secondary focus-within:outline-offset-2">
        <span className="block self-center pr-3 feather feather-search"></span>
        <input
          type="search"
          value={searchTerm}
          onChange={handleSearchTermChange}
          onKeyUp={handleSearchEnter}
          placeholder={t("searchLocation")}
          className="w-full border-0 text-sm outline-none my-2 mr-2"
        />
      </label>

      <div className={`flex ${searchTerm.length > 0 ? "" : "hidden md:flex"}`}>
        <div className="flex">
          <div className="w-36 sm:w-48 pr-4">
            <CategoriesDropdown
              selectedGenders={selectedGenders}
              handleChange={handleSelectedGenderChange}
            />
          </div>

          <div className="w-36 sm:w-48 pr-4">
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

        <button type="submit" className="grow btn btn-primary">
          {t("search")}
        </button>
      </div>
    </form>
  );
};
