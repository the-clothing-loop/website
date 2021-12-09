// Material
import Grid from "@material-ui/core/Grid";
import Typography from "@material-ui/core/Typography";
import { Helmet } from "react-helmet";

// Project resources
import AppIcon from "../images/clothing-loop.png";
import ProjectImg from "../images/Naamloze-presentatie.jpeg";
import Footer from "../components/Footer";
const Home = () => {
  return (
    <>
      <Helmet>
        <title>Clothing-Loop | Home</title>
        <meta name="description" content="Home" />
      </Helmet>
      <Grid container>
        <Grid item sm />
        <Grid item sm>
          <div className={"text-wrapper"}>
            <img src={AppIcon} alt="SFM logo" width="500" />
            <img src={ProjectImg} alt="Project Img" width="500" />
            <Typography component="p" className="intro-text">
              The Clothing Loop makes it easy and fun to share pre-loved clothes
              by connecting people in local communities that share a bag of
              clothes.
            </Typography>
            <Typography component="p">
              We are buying more and more garments and wearing them shorter and
              shorter. The Clothing Loop tackles this growing problem – while
              connecting people in the neighborhood in a fun and sustainable
              way. The idea of the Clothing Loop is simple: (large) bags filled
              with clothing travel a route past all participants in a particular
              city or neighborhood. Do you receive the bag at home? Then you can
              take out what you like and put back something that is still in
              good condition, but ready for a new owner. If you want, you can
              share a photo with your new addition in the corresponding WhatsApp
              group. Then you take the bag to the next neighbor on the list. We
              started a year ago in Amsterdam in the Netherlands as a
              corona-proof, local alternative for clothing swap events and now
              have more than 7500 participants spread over more than 210 chains
              across the country. The success has now been picked up by numerous
              (national) media (see for example: NOS). Our goal is to spread
              this initiative globally. To this end, we are building an online
              platform where anyone, anywhere can start or join a chain.{" "}
              <span>
                The Clothing Loop has been adopted by the global Slow Fashion
                Movement.
              </span>
            </Typography>{" "}
          </div>
        </Grid>
        <Grid item sm />
      </Grid>
    </>
  );
};

export default Home;
