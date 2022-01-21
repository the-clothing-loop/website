import React from "react";

import { SearchBar } from "./SearchBar";
import { ChainNotFound } from "./ChainNotFound";

import { IChain } from "../../types";
import { defaultTruePredicate, ChainPredicate } from "../../pages/FindChain";

const hasCommonElements = (arr1: string[], arr2: string[]) =>
  arr1.some((item: string) => arr2.includes(item));

interface IProps {
  setFilterChainPredicate: React.Dispatch<React.SetStateAction<ChainPredicate>>;
  handleFindChainCallback: (findChainPredicate: ChainPredicate) => boolean;
}

export const FindChainSearchBarContainer = ({
  setFilterChainPredicate,
  handleFindChainCallback,
}: IProps) => {
  const [searchTerm, setSearchTerm] = React.useState<string>("");
  const [selectedSizes, setSelectedSizes] = React.useState<string[]>([]);
  const [selectedGenders, setSelectedGenders] = React.useState<string[]>([]);
  const [isChainNotFound, setIsChainNotFound] = React.useState<boolean>(false);

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
    const newChainFilterPredicate = (chain: IChain) => {
      const { categories } = chain;

      return (
        (!selectedSizes.length ||
          hasCommonElements(categories.size, selectedSizes)) &&
        (!selectedGenders.length ||
          hasCommonElements(categories.gender, selectedGenders))
      );
    };

    setFilterChainPredicate(() => newChainFilterPredicate);

    if (!searchTerm) {
      return;
    }

    const newChainFindPredicate = (chain: IChain) =>
      chain.name.toLowerCase().includes(searchTerm.toLowerCase());

    const isFindChainResult = handleFindChainCallback(newChainFindPredicate);

    !isFindChainResult && setIsChainNotFound(true);
  };

  const handleBack = () => {
    setSearchTerm("");
    setSelectedSizes([]);
    setSelectedGenders([]);
    setIsChainNotFound(false);
    setFilterChainPredicate(() => defaultTruePredicate);
  };

  return (
    <>
      <SearchBar
        searchTerm={searchTerm}
        handleSearchTermChange={handleSearchTermChange}
        selectedGenders={selectedGenders}
        handleSelectedGenderChange={handleSelectedGenderChange}
        selectedSizes={selectedSizes}
        setSelectedSizes={setSelectedSizes}
        handleSearch={handleSearch}
      />

      {isChainNotFound && (
        <ChainNotFound searchTerm={searchTerm} backAction={handleBack} />
      )}
    </>
  );
};
