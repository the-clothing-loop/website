// Material
import { useEffect, useState } from "react";
import Grid from "@material-ui/core/Grid";
import Typography from "@material-ui/core/Typography";
import { Helmet } from "react-helmet";
import { makeStyles } from "@material-ui/core";
import theme from "../util/theme";
import Button from "@material-ui/core/Button";

// Project resources
import AppIcon from "../images/clothing-loop.png";
import ProjectImg from "../images/Naamloze-presentatie.jpeg";
import { getChainsLength } from "../util/firebase/chain";
import { ClassNames } from "@emotion/react";
import { ClassSharp } from "@material-ui/icons";

//Media
import HeroImg from "../images/hero-image.png";

const Home = () => {
  const [chainsCount, setChainsCount] = useState(0);
  const [usersCount, setUsersCount] = useState(0);

  const classes = makeStyles(theme as any)();

  useEffect(() => {
    (async () => {
      const chainsLengthResponse = await getChainsLength();
      setChainsCount(chainsLengthResponse);

      // const usersLengthResponse = await getUsersLength();
      // setUsersCount(usersLengthResponse);
    })();
  }, []);

  return (
    <>
      <Helmet>
        <title>Clothing-Loop | Home</title>
        <meta name="description" content="Home" />
      </Helmet>

      <div className={classes.landingPageWrapper}>
        <div
          style={{
            position: "absolute",
            height: "calc(100vh - 365px)",
            backgroundColor: "#D5ECDF",
            width: "100vw",
          }}
        ></div>
        <div
          className={classes.landingPageHero}
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            zIndex: "111111",
            paddingTop: "5%",
            position: "relative",
          }}
        >
          <div
            className={classes.heroTextWrapper}
            style={{ position: "relative", top: "10%" }}
          >
            <h1
              style={{
                fontSize: "112px",
                lineHeight: "112px",
                fontWeight: "900",
                color: "#518D7E",
              }}
            >
              Swap it, <br />
              don't <br />
              <span
                style={{ WebkitTextStroke: "1.5px #518d7e", color: "white" }}
              >
                shop it
              </span>
            </h1>
            <p>
              "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
              eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut
              enim ad minim veniam”
            </p>
            <Button
              className="btn btn-2"
              style={{
                width: "282px",
                height: "54.69px",
                border: "1px solid #F7C86F",
                fontSize: "21px",
                color: "white",
                textTransform: "inherit",
                borderRadius: "0px",
              }}
            >
              {"Find a loop ->"}
            </Button>
          </div>
          <div className={classes.heroImgWrapper}>
            <img
              src={HeroImg}
              alt="Kledingketting"
              style={{ width: "100%", height: "auto" }}
            />
            <Button className={classes.circleBtn}>{"->"}</Button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Home;
