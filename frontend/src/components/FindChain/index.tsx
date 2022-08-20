import React, { useContext, useEffect } from "react";
import * as Yup from "yup";

import { SearchBar } from "./SearchBar";
import { ChainNotFound } from "./ChainNotFound";

import { ChainsContext } from "../ChainsProvider";
import { defaultTruePredicate, ChainPredicate } from "../../pages/FindChain";
import { Chain } from "../../api/types";

const hasCommonElements = (arr1: string[], arr2: string[]) =>
  arr1.some((item: string) => arr2.includes(item));

interface IProps {
  setFilterChainPredicate: React.Dispatch<React.SetStateAction<ChainPredicate>>;
  handleFindChainCallback: (findChainPredicate: ChainPredicate) => boolean;
  initialValues?: any;
}

export const FindChainSearchBarContainer = ({
  setFilterChainPredicate,
  handleFindChainCallback,
  initialValues,
}: IProps) => {
  const [searchTerm, setSearchTerm] = React.useState<string>("");
  const [selectedSizes, setSelectedSizes] = React.useState<string[]>([]);
  const [selectedGenders, setSelectedGenders] = React.useState<string[]>([]);
  const [isChainNotFound, setIsChainNotFound] = React.useState<boolean>(false);
  const [formAutoFilled, setFormAutoFilled] = React.useState<boolean>(false);
  const chains = useContext(ChainsContext);

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
    const newChainFilterPredicate = (chain: Chain) => {

      return (
        (!selectedSizes.length ||
          hasCommonElements(chain.sizes, selectedSizes)) &&
        (!selectedGenders.length ||
          hasCommonElements(chain.genders, selectedGenders))
      );
    };

    setFilterChainPredicate(() => newChainFilterPredicate);

    if (!searchTerm) {
      return;
    }

    const newChainFindPredicate = (chain: Chain) =>
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

  useEffect(() => {
    // chains may not have loaded yet
    if (!chains.length || !Object.keys(initialValues).length) {
      return;
    }
    const schema = Yup.object({
      searchTerm: Yup.string().default(""),
      sizes: Yup.array().of(Yup.string()).default([]),
      genders: Yup.array().of(Yup.string()).default([]),
    });

    try {
      let validated = schema.validateSync(initialValues);
      setSearchTerm(validated.searchTerm);
      setSelectedSizes(validated.sizes);
      setSelectedGenders(validated.genders);
      setFormAutoFilled(true);
    } catch (error) {
      console.error("Invalid query string parameters");
      console.error(error);
      return;
    }
  }, [chains]);

  useEffect(() => {
    handleSearch();
  }, [formAutoFilled]);

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
