import { useEffect, useState, useContext } from "react";
import { useHistory } from "react-router-dom";
import ReactMapGL, { Marker, Popup } from "react-map-gl";
import { useTranslation } from "react-i18next";
import { Helmet } from "react-helmet";

// Material UI
import { Button, formatMs } from "@material-ui/core";
import Typography from "@material-ui/core/Typography";
import Card from "@material-ui/core/Card";
import CardActions from "@material-ui/core/CardActions";
import CardContent from "@material-ui/core/CardContent";
import Paper from "@material-ui/core/Paper";
import InputBase from "@material-ui/core/InputBase";
import IconButton from "@material-ui/core/IconButton";
import SearchIcon from "@material-ui/icons/Search";
import FormControl from "@material-ui/core/FormControl";
import FormGroup from "@material-ui/core/FormGroup";
import Divider from "@material-ui/core/Divider";
import { makeStyles } from "@material-ui/core";
import Chip from "@material-ui/core/Chip";

// Project resources
import { getChains } from "../util/firebase/chain";
import { AuthContext } from "../components/AuthProvider";
import { addUserToChain } from "../util/firebase/chain";
import { IChain, IViewPort } from "../types";
import theme from "../util/theme";
import { getUserById } from "../util/firebase/user";
import categories from "../util/categories";

const accessToken = {
  mapboxApiAccessToken: process.env.REACT_APP_MAPBOX_KEY,
};

const FindChain = () => {
  const history = useHistory();
  const { t } = useTranslation();
  const { user } = useContext(AuthContext);

  const classes = makeStyles(theme as any)();

  const [viewport, setViewport] = useState<IViewPort | {}>({});
  const [chainData, setChainData] = useState<IChain[]>([]);
  const [selectedChain, setSelectedChain] = useState<IChain | null>(null);
  const [showPopup, setShowPopup] = useState(false);

  const [value, setValue] = useState<IChain | null>(null);

  const [filteredChains, setFilteredChains] = useState<IChain[]>([]);

  const [userId, setUserId] = useState("");
  const [role, setRole] = useState<string | null>(null);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedGenders, setSelectedGenders] = useState<string[]>([]);

  useEffect(() => {
    (async () => {
      const chainResponse = await getChains();
      setChainData(chainResponse);
      setFilteredChains(chainResponse);

      //get user role
      if (user) {
        setUserId(user.uid);
        const userRole = await getUserById(user.uid);
        setRole(userRole.role);
      }

      setViewport({
        latitude: 0,
        longitude: 0,
        width: "100vw",
        height: "100vh",
        zoom: 1,
      });
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setViewport({
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
            width: "100vw",
            height: "100vh",
            zoom: 10,
          });
        },
        (err) => {
          console.error(`Couldn't receive location: ${err.message}`);
        }
      );
    })();
  }, []);

  //get selected categories
  const handleChange = (
    e: any,
    value: any,
    categories: any,
    setCategories: any
  ) => {
    if (!categories.includes(value)) {
      setCategories([...categories, value]);
    } else {
      setCategories(categories.filter((id: any) => id !== value));
    }
  };

  //filter selected categories
  useEffect(() => {
    const hasCommonElements = (arr1: any, arr2: any) =>
      arr1.some((item: any) => arr2.includes(item));

    let filteredChains = chainData.filter((chain, i) => {
      if (!selectedGenders.length) {
        return true;
      }

      return (
        chain.categories &&
        chain.categories.gender &&
        hasCommonElements(chain.categories.gender, selectedGenders)
      );
    });

    filteredChains = filteredChains.filter((chain) => {
      if (!selectedSizes.length) {
        return true;
      }

      return (
        chain.categories &&
        chain.categories.size &&
        hasCommonElements(chain.categories.size, selectedSizes)
      );
    });

    setFilteredChains(filteredChains);
  }, [selectedGenders, selectedSizes]);

  if (!accessToken.mapboxApiAccessToken) {
    return <div>Access tokens not configured</div>;
  }

  //get search term from input
  const onChange = (e: any) => {
    let searchTerm: string = e.target.value;

    //if no search term, show nothing
    if (searchTerm == ""){
      return setValue(null);
    }

    //find matches
    let matches: IChain[] = [];
    let matchesLength: number = 0;
    chainData.filter((val) => {
      if (val.name.toLowerCase().includes(searchTerm.toLowerCase())) {
        matches.push(val);
        matchesLength++;
      }
    });

    //show one match or not found
    if (matchesLength == 0) {
      let noMatches = {} as IChain;
      noMatches.id = "-1";
      setValue(noMatches);
    } else {
      setValue(matches[0]);
    }
  };

  //render location on result selection
  const handleSelect = () => {
    setViewport({
      latitude: value?.latitude,
      longitude: value?.longitude,
      width: "100vw",
      height: "100vh",
      zoom: 8,
    });
  };

  const signupToChain = async (e: any) => {
    e.preventDefault();
    if (user) {
      await addUserToChain(selectedChain!.id, user.uid);
      history.push({ pathname: "/thankyou" });
    } else {
      history.push({
        pathname: `/users/signup/${selectedChain?.id}`,
        state: {
          chainId: selectedChain?.id,
        },
      });
    }
  };

  const viewChain = (e: any) => {
    e.preventDefault();
    history.push(`/loops/members/${selectedChain?.id}`);
  };

  return (
    <>
      <Helmet>
        <title>Clothing-Loop | Find Loop</title>
        <meta name="description" content="Find Loop" />
      </Helmet>
      <ReactMapGL
        mapboxApiAccessToken={accessToken.mapboxApiAccessToken}
        mapStyle="mapbox://styles/mapbox/streets-v11"
        {...viewport}
        onViewportChange={(newView: IViewPort) => setViewport(newView)}
      >
        <div className={"filter-wrapper"}>
          <Paper
            component="form"
            className={classes.root2}
            style={{ borderRadius: "8px", border: "1px solid #DADCE0" }}
          >
            <InputBase
              className={classes.input}
              placeholder="Search Clothing Loop"
              inputProps={{ "aria-label": "search for clothing loop" }}
              onChange={onChange}
              key={"search-input"}
            />
            <IconButton
              type="submit"
              className={classes.iconButton}
              aria-label="search"
              key={"search-btn"}
            >
              <SearchIcon />
            </IconButton>
          </Paper>
          {value ? (
            (value.id == "-1") ?
              <Button key={"-1"} style={{cursor: "auto"}}>
                <div>
                  No Matches Found<br/>
                  <Link to="/loops/new-signup">Start a new loop</Link> or <Link to="/">go to home page</Link>
                </div>
              </Button> :
              <Button key={`${value}-btn`} onClick={handleSelect}>
                {value.name}
              </Button>
          ) : null}
          <FormControl>
            <FormGroup className="filter-form">
              <Typography variant="body1">Categories</Typography>
              <div className={"inputs-wrapper"}>
                {categories.genders.map((value, i) => (
                  <div key={value}>
                    <input
                      className="map-cat-input"
                      key={`input-${value}-${i}`}
                      id={`${value}`}
                      type="checkbox"
                      name={value}
                      onChange={(e: any) =>
                        handleChange(
                          e,
                          value,
                          selectedGenders,
                          setSelectedGenders
                        )
                      }
                    ></input>
                    <label key={`label-${value}-${i}`} htmlFor={value}>
                      <Typography variant="body2">{`${value}'s clothing`}</Typography>
                    </label>
                  </div>
                ))}
              </div>
            </FormGroup>
          </FormControl>

          <FormControl>
            <FormGroup className="filter-form">
              <Typography variant="body1">Sizes</Typography>
              <div className={"inputs-wrapper"}>
                {categories.sizes.map((value, i) => (
                  <div key={value}>
                    <input
                      className="map-cat-input"
                      key={`input-${value}-${i}`}
                      id={`${value}`}
                      type="checkbox"
                      name={value}
                      onChange={(e: any) =>
                        handleChange(e, value, selectedSizes, setSelectedSizes)
                      }
                    ></input>
                    <label
                      style={{
                        textTransform: "uppercase",
                        width: "40px",
                        height: "40px",
                        padding: "0",
                        textAlign: "center",
                      }}
                      key={`label-${value}-${i}`}
                      htmlFor={value}
                    >
                      <Typography
                        variant="body2"
                        className="input-label-typography"
                      >{`${value}`}</Typography>
                    </label>
                  </div>
                ))}
              </div>
            </FormGroup>
          </FormControl>
        </div>

        {filteredChains.map((chain) =>
          chain.published ? (
            <Marker
              key={chain.id}
              latitude={chain.latitude}
              longitude={chain.longitude}
            >
              {" "}
              <img
                onClick={(e: any) => {
                  e.preventDefault();
                  setSelectedChain(chain);
                  setShowPopup(true);
                }}
                id="marker"
                src="https://cdn0.iconfinder.com/data/icons/small-n-flat/24/678111-map-marker-512.png"
                alt="Map Marker"
              />
            </Marker>
          ) : null
        )}

        {selectedChain && showPopup ? (
          <Popup
            latitude={selectedChain.latitude}
            longitude={selectedChain.longitude}
            closeOnClick={false}
            onClose={() => setShowPopup(false)}
            dynamicPosition={false}
          >
            <Card
              className={classes.root}
              style={{ borderRadius: "8px", padding: "10px 10px 15px" }}
            >
              <CardContent>
                <Typography
                  className={classes.title}
                  component="p"
                  variant="h4"
                  gutterBottom
                >
                  {selectedChain.name}
                </Typography>
                <Typography
                  variant="body2"
                  component="p"
                  style={{ padding: "2% 0" }}
                >
                  {selectedChain.address}
                </Typography>
                <Typography
                  variant="body2"
                  component="p"
                  style={{ padding: "2% 0" }}
                >
                  {selectedChain.description}
                </Typography>
                <Divider />
                <div className={"chain-categories"}>
                  {selectedChain.categories.gender
                    ? selectedChain.categories.gender.map((category, i) => {
                        return (
                          <Chip
                            key={i}
                            label={`${category}'s clothing`}
                            color="primary"
                            style={{ marginRight: "1%" }}
                          />
                        );
                      })
                    : null}
                  {selectedChain.categories.size
                    ? selectedChain.categories.size.map((size, i) => {
                        return (
                          <Chip
                            key={i}
                            label={size}
                            color="primary"
                            style={{
                              marginRight: "1%",
                              textTransform: "uppercase",
                            }}
                          />
                        );
                      })
                    : null}
                </div>
              </CardContent>

              {role === "admin" ? (
                <CardActions>
                  <Button
                    variant="contained"
                    color="primary"
                    className={"card-button"}
                    onClick={(e) => signupToChain(e)}
                    key={"btn-signup"}
                  >
                    {t("signup")}
                  </Button>{" "}
                  <Button
                    key={"btn-view"}
                    variant="contained"
                    color="secondary"
                    className={"card-button"}
                    onClick={(e) => viewChain(e)}
                  >
                    {t("view")}
                  </Button>{" "}
                </CardActions>
              ) : (
                <CardActions>
                  <Button
                    key={"btn-signup"}
                    variant="contained"
                    color="primary"
                    className={"card-button"}
                    onClick={(e) => signupToChain(e)}
                  >
                    {t("signup")}
                  </Button>{" "}
                </CardActions>
              )}
            </Card>
          </Popup>
        ) : null}
      </ReactMapGL>
    </>
  );
};

export default FindChain;
