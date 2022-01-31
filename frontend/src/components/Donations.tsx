//Media
import { ClassNames } from "@emotion/react";
import HeroImg from "../images/hero-image.png";

//MUI
import { makeStyles } from "@material-ui/core";
import theme from "../util/theme";

const Donations = () => {
  const classes = makeStyles(theme as any)();

  //TODO:
  //this page should be linked to a third-party platform 
  //or custom built donations flow

  return (
    <div className={classes.donationsWrapper}>
      <div className="background-box"></div>

      <div>
        <div className="image-wrapper">
          <img src={HeroImg} style={{ width: "100%", height: "auto" }} />
        </div>

        <div className="text-wrapper">
          <h3>
            All the <br />
            small bits <br />
            help
          </h3>
          <p>
            By donating a <span>cup of coffee</span> to the creators we can help
            you find your next sweater
          </p>
          <button>Donate ☕ </button>
        </div>
      </div>
    </div>
  );
};

export default Donations;
