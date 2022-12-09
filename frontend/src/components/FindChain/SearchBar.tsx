import { ChangeEvent, KeyboardEvent } from "react";
import { useTranslation } from "react-i18next";

import categories from "../../util/categories";
import { SetValue } from "../../util/form.hooks";
import CategoriesDropdown from "../CategoriesDropdown";
import SizesDropdown from "../SizesDropdown";

export interface SearchValues {
  searchTerm: string;
  sizes: string[];
  genders: string[];
}

interface Props {
  values: SearchValues;
  setValue: SetValue<SearchValues>;
  onSearch: () => void;
}

export default function SearchBar(props: Props) {
  const { t } = useTranslation();

  function handleSearchEnter(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      props.onSearch();
    }
  }
  function handleSearchChange(e: ChangeEvent<HTMLInputElement>) {
    props.setValue("searchTerm", e.target.value);
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        props.onSearch();
      }}
      className="container mx-auto flex p-4 md:px-20 bg-white flex-wrap sm:flex-nowrap flex-col md:flex-row"
    >
      <label className="flex lg:w-auto md:flex-grow h-12 md:mr-4 sm:mb-4 md:mb-0 input input-bordered input-secondary focus-within:outline-2 focus-within:outline focus-within:outline-secondary focus-within:outline-offset-2">
        <span className="block self-center pr-3 feather feather-search"></span>
        <input
          type="search"
          value={props.values.searchTerm}
          onChange={handleSearchChange}
          onKeyUp={handleSearchEnter}
          placeholder={t("searchLocation")}
          className="w-full border-0 text-sm outline-none my-2 mr-2"
        />
      </label>

      <div
        className={`flex ${
          props.values.searchTerm.length > 0 ? "" : "hidden md:flex"
        }`}
      >
        <div className="flex">
          <div className="w-36 sm:w-48 pr-0 sm:pr-4">
            <CategoriesDropdown
              selectedGenders={props.values.genders}
              handleChange={(gs) => props.setValue("genders", gs)}
            />
          </div>

          <div className="w-36 sm:w-48 pr-0 sm:pr-4">
            <SizesDropdown
              className="max-xs:dropdown-end"
              filteredGenders={
                props.values.genders.length
                  ? props.values.genders
                  : Object.keys(categories)
              }
              selectedSizes={props.values.sizes}
              handleChange={(s) => props.setValue("sizes", s)}
            />
          </div>
        </div>

        <button type="submit" className="grow btn btn-primary">
          <span className="hidden sm:inline">{t("search")}</span>
          <span className="sm:hidden inline feather feather-search"></span>
        </button>
      </div>
    </form>
  );
}
