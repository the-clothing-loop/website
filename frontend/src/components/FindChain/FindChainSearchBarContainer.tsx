import {
  ChangeEvent,
  Dispatch,
  SetStateAction,
  useContext,
  useEffect,
  useState,
} from "react";
import { useTranslation } from "react-i18next";
import { useHistory } from "react-router";

import SearchBar from "./SearchBar";
import { ChainsContext } from "../../providers/ChainsProvider";
import { defaultTruePredicate, ChainPredicate } from "../../pages/FindChain";
import { Chain } from "../../api/types";
import { ToastContext } from "../../providers/ToastProvider";

const hasCommonElements = (arr1: string[], arr2: string[]) =>
  arr1.some((item: string) => arr2.includes(item));

export interface SearchValues {
  searchTerm: string;
  sizes: string[];
  genders: string[];
}

interface IProps {
  setSearchValues: Dispatch<SetStateAction<ChainPredicate>>;
  onSearchCallback: (findChainPredicate: ChainPredicate) => boolean;
  initialValues: SearchValues;
}

export default function FindChainSearchBarContainer({
  setSearchValues,
  onSearchCallback,
  initialValues,
}: IProps) {
  const chains = useContext(ChainsContext);
  const { addToast } = useContext(ToastContext);
  const { t } = useTranslation();

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedGenders, setSelectedGenders] = useState<string[]>([]);
  const [formAutoFilled, setFormAutoFilled] = useState(false);

  const handleSearchTermChange = (event: ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const handleSearch = () => {
    const newChainFilterPredicate = (chain: Chain) => {
      return (
        (!selectedSizes.length ||
          hasCommonElements(chain.sizes || [], selectedSizes)) &&
        (!selectedGenders.length ||
          hasCommonElements(chain.genders || [], selectedGenders))
      );
    };

    setSearchValues(() => newChainFilterPredicate);

    if (!searchTerm) {
      return;
    }

    const newChainFindPredicate = (chain: Chain) =>
      chain.name.toLowerCase().includes(searchTerm.toLowerCase());

    const isFindChainResult = onSearchCallback(newChainFindPredicate);

    if (!isFindChainResult) {
      addToast({
        type: "error",
        message: t("noLoopsFoundIn") + ": " + searchTerm,
        actions: [
          {
            fn: () => setSearchTerm(""),
            text: t("clear"),
            type: "ghost",
          },
        ],
      });
    }
  };

  const handleBack = () => {
    setSearchTerm("");
    setSelectedSizes([]);
    setSelectedGenders([]);
    setSearchValues(() => defaultTruePredicate);
  };

  useEffect(() => {
    // chains may not have loaded yet
    if (!chains.length || !Object.keys(initialValues).length) {
      return;
    }

    try {
      setSearchTerm(initialValues.searchTerm);
      setSelectedSizes(initialValues.sizes);
      setSelectedGenders(initialValues.genders);
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
        handleSelectedGenderChange={(gs) => setSelectedGenders(gs)}
        selectedSizes={selectedSizes}
        setSelectedSizes={setSelectedSizes}
        handleSearch={handleSearch}
      />
    </>
  );
}
