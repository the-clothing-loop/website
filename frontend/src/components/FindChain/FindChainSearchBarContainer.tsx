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

const hasCommonElements = (arr1: string[], arr2: string[]) =>
  arr1.some((item: string) => arr2.includes(item));

export interface SearchValues {
  searchTerm: string;
  sizes: string[];
  genders: string[];
}

interface IProps {
  setFilterChainPredicate: Dispatch<SetStateAction<ChainPredicate>>;
  handleFindChainCallback: (findChainPredicate: ChainPredicate) => boolean;
  initialValues?: any;
}

export default function FindChainSearchBarContainer({
  setFilterChainPredicate,
  handleFindChainCallback,
  initialValues,
}: IProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedGenders, setSelectedGenders] = useState<string[]>([]);
  const [isChainNotFound, setIsChainNotFound] = useState(false);
  const [formAutoFilled, setFormAutoFilled] = useState(false);
  const chains = useContext(ChainsContext);

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

      {isChainNotFound && (
        <ChainNotFound searchTerm={searchTerm} backAction={handleBack} />
      )}
    </>
  );
}

function ChainNotFound({
  searchTerm,
  backAction,
}: {
  searchTerm: string;
  backAction: any;
}) {
  const { t } = useTranslation();
  const history = useHistory();

  return (
    <div className="absolute z-30 max-w-screen">
      <div className="shadow-lg rounded-lg bg-white m-4 p-4 sm:w-72">
        <button
          aria-label="close"
          className="absolute top-6 right-6 btn btn-sm btn-circle btn-ghost feather feather-x"
          onClick={backAction}
        />

        <h1 className="font-semibold text-secondary mb-2 pr-10">
          {`${t("noLoopsFoundIn")}`} <span>{searchTerm}</span>
        </h1>

        <p className="mb-4">{t("ThereIsNoActiveLoopInYourRegion")}</p>

        <div>
          <button
            className="btn btn-secondary btn-sm btn-outline"
            onClick={backAction}
          >
            {t("back")}
          </button>
          <button
            className="btn btn-primary btn-sm ml-3"
            onClick={() => history.push("/loops/new/users/signup")}
            type="submit"
          >
            {t("startNewLoop")}
          </button>
        </div>
      </div>
    </div>
  );
}
