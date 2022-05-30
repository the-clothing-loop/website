import { useState } from "react";
import { useHistory } from "react-router-dom";

import { SearchBar } from "./SearchBar";

/*
 * A searchbar for finding loops that can be used separately from the "find
 * loops" page. It takes the user to the "find loops" page then carries out a
 * search with whatever values were entered
 */
export const StandaloneSearchBar = () => {
  const history = useHistory();
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedGenders, setSelectedGenders] = useState<string[]>([]);

  const handleSearchTermChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setSearchTerm(event.target.value);
  };

  const handleSelectedGenderChange = (event: React.ChangeEvent<any>) => {
    const {
      target: { value },
    } = event;

    setSelectedGenders(typeof value === "string" ? value.split(",") : value);
  };

  const handleSearch = () => {
    const queryParams = new URLSearchParams();
    queryParams.append("searchTerm", searchTerm);
    for (const size of selectedSizes) {
      queryParams.append("sizes", size);
    }
    for (const gender of selectedGenders) {
      queryParams.append("genders", gender);
    }
    history.push("/loops/find?" + queryParams.toString());
  };

  return (
    <SearchBar
      searchTerm={searchTerm}
      handleSearchTermChange={handleSearchTermChange}
      selectedGenders={selectedGenders}
      handleSelectedGenderChange={handleSelectedGenderChange}
      selectedSizes={selectedSizes}
      setSelectedSizes={setSelectedSizes}
      handleSearch={handleSearch}
    />
  );
};
