import MapboxGeocoder from "@mapbox/mapbox-gl-geocoder";
import { FormEvent, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import Geocoding, { Estimate } from "../../pages/Geocoding";

import categories from "../../util/categories";
import useForm, { SetValue } from "../../util/form.hooks";
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
    queryParams.append("lo", longLat.at(0)!.toString());
    queryParams.append("la", longLat.at(1)!.toString());
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
  const [estimate, setEstimate] = useState<Estimate>();
  const [isEstimate, setIsEstimate] = useState(false);
  const [longLat, setLongLat] = useState<GeoJSON.Position>();
  const [values, setValue] = useForm<SearchValues>({
    searchTerm: "",
    sizes: [],
    genders: [],
    ...props.initialValues,
  });

  function handleSearchChange(e: MapboxGeocoder.Result) {
    setValue("searchTerm", e.place_name);
    setLongLat(e.geometry.coordinates);
    setIsEstimate(false);
  }

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    let _longLat = longLat;
    let _search = values;

    // This happens when the user cancels address selection
    if (isEstimate && estimate) {
      console.log("estimate", estimate);
      _longLat = estimate.first?.geometry.coordinates;
      _search.searchTerm = estimate.query;
    }

    props.onSearch(_search, _longLat);
  }

  function handleSetEstimate(e: Estimate) {
    setEstimate(e);
    setIsEstimate(true);
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
      <label className="flex lg:w-auto md:flex-grow h-12 md:mr-4 sm:mb-4 md:mb-0">
        <Geocoding
          className="z-40 w-full"
          onResult={handleSearchChange}
          onEstimate={handleSetEstimate}
          types={["country", "region", "place", "postcode", "address"]}
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

          <div className="w-36 sm:w-48 pr-0 sm:pr-4">
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

        <button type="submit" className="grow btn btn-primary">
          <span className="hidden sm:inline">{t("search")}</span>
          <span className="sm:hidden inline feather feather-search"></span>
        </button>
      </div>
    </form>
  );
}
