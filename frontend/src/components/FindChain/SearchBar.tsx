import { FormEvent, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import Geocoding, { Estimate } from "../../pages/Geocoding";

import categories from "../../util/categories";
import useForm from "../../util/form.hooks";
import CategoriesDropdown from "../CategoriesDropdown";
import SizesDropdown from "../SizesDropdown";

export interface SearchValues {
  searchTerm: string;
  sizes: string[];
  genders: string[];
}

interface Props {
  initialValues?: SearchValues;
  onSearch: (
    search: SearchValues,
    center: GeoJSON.Position | undefined
  ) => void;
}

export function toUrlSearchParams(
  search: SearchValues,
  longLat: GeoJSON.Position | undefined
) {
  const queryParams = new URLSearchParams();
  if (longLat) {
    queryParams.append("lo", longLat[0]!.toString());
    queryParams.append("la", longLat[1]!.toString());
  }
  if (search.searchTerm) queryParams.append("q", search.searchTerm);
  for (const size of search.sizes) {
    queryParams.append("s", size);
  }
  for (const gender of search.genders) {
    queryParams.append("g", gender);
  }
  return "?" + queryParams.toString();
}

export default function SearchBar(props: Props) {
  const { t } = useTranslation();
  const [longLat, setLongLat] = useState<GeoJSON.Position>();
  const [values, setValue] = useForm<SearchValues>({
    searchTerm: "",
    sizes: [],
    genders: [],
    ...props.initialValues,
  });
  let refSubmit = useRef<any>();

  function handleSearchChange(e: Estimate) {
    setValue("searchTerm", e.query);
    setLongLat(e.first);
  }
  function handleSearchSelected() {
    (refSubmit.current as HTMLButtonElement).focus({
      preventScroll: true,
      focusVisible: true,
    } as any);
  }

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    props.onSearch(values, longLat);
  }

  const emptyValues = useMemo(
    () =>
      Object.values(values).reduce((isEmpty, v) => {
        return isEmpty ? v.length === 0 : false;
      }, true),
    [values]
  );

  return (
    <form
      onSubmit={handleSubmit}
      className="container mx-auto flex p-4 md:px-20 bg-white flex-wrap sm:flex-nowrap flex-col md:flex-row group"
    >
      <label
        className="flex lg:w-auto md:flex-grow h-12 ltr:md:mr-4 sm:mb-4 md:mb-0"
        aria-label="search"
      >
        <Geocoding
          initialAddress={values.searchTerm}
          className="z-40 w-full"
          onResult={handleSearchChange}
          onSelectResult={handleSearchSelected}
          placeholder={t("location")}
          types={[
            "country",
            "region",
            "place",
            "locality",
            "neighborhood",
            "postcode",
            "address",
            "poi",
          ]}
        />
      </label>

      <div
        className={`flex group-focus-within:flex ${
          !emptyValues ? "" : "hidden md:flex"
        }`}
      >
        <div className="flex">
          <div className="w-36 sm:w-48 pr-0 sm:pr-4">
            <CategoriesDropdown
              selectedGenders={values.genders}
              handleChange={(gs) => setValue("genders", gs)}
            />
          </div>

          <div className="w-36 sm:w-48 pr-0 sm:pr-4 rtl:sm:pl-4">
            <SizesDropdown
              className="max-xs:dropdown-end"
              filteredGenders={
                values.genders.length ? values.genders : Object.keys(categories)
              }
              selectedSizes={values.sizes}
              handleChange={(s) => setValue("sizes", s)}
            />
          </div>
        </div>

        <button type="submit" className="grow btn btn-primary" ref={refSubmit}>
          <span className="hidden sm:inline">{t("search")}</span>
          <span className="sm:hidden inline feather feather-search"></span>
        </button>
      </div>
    </form>
  );
}
