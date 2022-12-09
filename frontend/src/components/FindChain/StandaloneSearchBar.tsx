import { useState } from "react";
import { useHistory } from "react-router-dom";

import useForm from "../../util/form.hooks";
import SearchBar, { SearchValues } from "./SearchBar";

/*
 * A searchbar for finding loops that can be used separately from the "find
 * loops" page. It takes the user to the "find loops" page then carries out a
 * search with whatever values were entered
 */
export default function StandaloneSearchBar() {
  const history = useHistory();

  const [search, setSearchValue] = useForm<SearchValues>({
    searchTerm: "",
    sizes: [],
    genders: [],
  });

  function handleSearch() {
    const queryParams = new URLSearchParams();
    queryParams.append("searchTerm", search.searchTerm);
    for (const size of search.sizes) {
      queryParams.append("sizes", size);
    }
    for (const gender of search.genders) {
      queryParams.append("genders", gender);
    }
    history.push("/loops/find?" + queryParams.toString());
  }

  return (
    <SearchBar
      values={search}
      setValue={setSearchValue}
      onSearch={handleSearch}
    />
  );
}
