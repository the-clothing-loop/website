import * as React from "react";
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useHistory } from "react-router-dom";

//material ui
import OutlinedInput from "@mui/material/OutlinedInput";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
import { makeStyles, Typography } from "@material-ui/core";
import { Button } from "@material-ui/core";
import Paper from "@material-ui/core/Paper";
import ListItemText from "@mui/material/ListItemText";
import Checkbox from "@mui/material/Checkbox";
import TextField from "@mui/material/TextField";
import SizesDropdown from "./SizesDropdown";
import InputAdornment from "@mui/material/InputAdornment";
import Search from "@mui/icons-material/Search";

//project resources
import theme from "../util/theme";
import categories from "../util/categories";
import { IChain, IViewPort } from "../types";

interface IProps {
  data: IChain[];
  setData: (el: IChain[]) => void;
  setViewport: (el: IViewPort) => void;
}

const SearchBar: React.FC<IProps> = ({
  data,
  setData,
  setViewport,
}: IProps) => {
  const classes = makeStyles(theme as any)();
  const { t } = useTranslation();

  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedGenders, setSelectedGenders] = useState<string[]>([]);
  const [value, setValue] = useState<IChain | null>(null);
  const [filteredData, setFilteredData] = useState<IChain[]>([]);
  const [noResultFound, setNoResultFound] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>("");

  const chainData = data;
  const filterData = setData;

  let history = useHistory();

  useEffect(() => {
    setFilteredData(data);
  }, []);

  //get selected categories
  const handleChange = (event: any, setCategories: any) => {
    const {
      target: { value },
    } = event;

    setCategories(typeof value === "string" ? value.split(",") : value);
  };

  const handleSubmit = (e: any) => {
    e.preventDefault();
    const hasCommonElements = (arr1: any, arr2: any) =>
      arr1.some((item: any) => arr2.includes(item));

    if (chainData instanceof Array) {
      let filteredChains: Array<IChain>;
      filteredChains = chainData.filter((chain: IChain, i: any) => {
        return (
          (!selectedSizes.length ||
            (chain.categories &&
              chain.categories.size &&
              hasCommonElements(chain.categories.size, selectedSizes))) &&
          (!selectedGenders.length ||
            (chain.categories &&
              chain.categories.gender &&
              hasCommonElements(chain.categories.gender, selectedGenders)))
        );
      });
      filterData(filteredChains);

      //if no search term, show nothing
      if (searchTerm === "") {
        return setValue(null);
      }

      if (filteredChains instanceof Array) {
        var match: IChain | undefined;
        match = filteredChains.find((val: any) =>
          val.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }

      //show the match or not found
      if (match) {
        setViewport({
          latitude: match?.latitude,
          longitude: match?.longitude,
          width: "100vw",
          height: "95vh",
          zoom: 8,
        });
      } else {
        setValue(null);
        filterData(filteredChains);
        setNoResultFound(true);
      }
    }
  };

  //get search term from input
  const onChange = (e: any) => {
    setSearchTerm(e.target.value);
  };

  const backAction = () => {
    if (chainData instanceof Array) {
      setSearchTerm("");
      setSelectedGenders([]);
      setSelectedSizes([]);
      filterData(chainData);
      setNoResultFound(false);
    }
  };

  return (
    <div>
      <Paper component="form" className={classes.root2}>
        <TextField
          id="outlined-basic"
          placeholder={t("searchLocation")}
          variant="standard"
          className={classes.input}
          onChange={onChange}
          value={searchTerm}
          InputProps={{
            startAdornment: (
              <InputAdornment
                position="start"
                className={classes.inputAdornment}
              >
                <Search />
              </InputAdornment>
            ),
          }}
        />

        <FormControl className={classes.formControl}>
          <Select
            displayEmpty
            className={classes.select}
            labelId="demo-multiple-checkbox-label"
            id="demo-multiple-checkbox"
            multiple
            variant="standard"
            value={selectedGenders}
            onChange={(e: any) => handleChange(e, setSelectedGenders)}
            renderValue={(selected) => {
              if (selected.length === 0) {
                return <em className={classes.em}>{t("categories")}</em>;
              }

              return selected.join(", ");
            }}
          >
            {Object.keys(categories).map((value: any) => (
              <MenuItem key={value} value={value}>
                <Checkbox
                  className={classes.checkbox}
                  checked={selectedGenders.includes(value) ? true : false}
                />
                <ListItemText
                  primary={value}
                  className={classes.listItemText}
                />
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <div className={classes.formControl}>
          <SizesDropdown
            className={classes.select}
            setSizes={setSelectedSizes}
            genders={selectedGenders}
            sizes={selectedSizes}
            label={t("sizes")}
            fullWidth={false}
          />
        </div>

        <Button
          className={classes.submitBtn}
          variant="contained"
          color="primary"
          onClick={handleSubmit}
          key={"btn-submit"}
          type="submit"
        >
          {t("search")}
        </Button>
      </Paper>

      {noResultFound ? (
        <div className={classes.alertContainer}>
          <Typography component="h1">
            {`${t("noLoopsFoundIn")}`} <span>"{searchTerm}"</span>
          </Typography>
          <Typography component="p">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
            eiusmod tempor incididunt ut labore et dolore magna aliqua.
          </Typography>
          <div>
            {" "}
            <Button
              className={classes.submitBtn}
              variant="contained"
              color="primary"
              onClick={backAction}
              key={"btn-submit-1"}
            >
              {t("back")}
            </Button>{" "}
            <Button
              className={classes.submitBtn}
              variant="contained"
              color="primary"
              onClick={() => history.push("/loops/new-signup")}
              key={"btn-submit-2"}
              type="submit"
            >
              {t("startNewLoop")}
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default SearchBar;
