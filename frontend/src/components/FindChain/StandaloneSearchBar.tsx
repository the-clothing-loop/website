import { useHistory } from "react-router-dom";

import SearchBar, { SearchValues, toUrlSearchParams } from "./SearchBar";

/*
 * A searchbar for finding loops that can be used separately from the "find
 * loops" page. It takes the user to the "find loops" page then carries out a
 * search with whatever values were entered
 */
export default function StandaloneSearchBar() {
  const history = useHistory();

  function handleSearch(
    search: SearchValues,
    longLat: GeoJSON.Position | undefined
  ) {
    const queryParams = toUrlSearchParams(search, longLat);
    history.push("/loops/find" + queryParams);
  }

  return <SearchBar onSearch={handleSearch} />;
}
