import { Typography } from "@material-ui/core";
import { makeStyles } from "@material-ui/styles";
import theme from "../util/theme";
import { Helmet } from "react-helmet";

//media
import PressClipping from "../images/press-clippings-site.jpg";
import TeamImg from "../images/Team-pics.jpg";

const About = () => {
  const classes = makeStyles(theme as any)();

  return (
    <>
      <Helmet>
        <title>The Clothing Loop | About</title>
        <meta name="description" content="About The Clothing Loop" />
      </Helmet>
      <div className={classes.legalPagesWrapper}>
        <Typography component="h1" className={classes.pageTitle}>
          {"About The Clothing Loop"}
        </Typography>
        <div className={classes.legalPagesContentWrapper}>
          <div className="iframe-wrapper">
            <div className="iframe-content">
              <iframe
                src="https://player.vimeo.com/video/673700502?h=90c8532936&amp;badge=0&amp;autopause=0&amp;player_id=0&amp;app_id=58479"
                allow="autoplay; fullscreen; picture-in-picture"
                className="vimeo-video"
              ></iframe>
            </div>
            <script src="https://player.vimeo.com/api/player.js"></script>
          </div>
          <Typography component="p">
            The Clothing Loop is an initiative that allows people to easily swap
            clothes with others in their own neighbourhood. It’s fun, free and
            sustainable! The idea is simple: (large) bags filled with clothes​
            travel along a route past all participants in a certain city or
            district.
          </Typography>
          <Typography component="p">
            Do you get the bag ​delivered to your​ home by the person before you
            in the Loop? ​Time to shop! Take ​items you like, and put back
            something that is still in good condition, and ready for a new
            owner. If you want, share a photo with your latest find in the
            corresponding communication channel. It is so nice to see where
            items end up! Then you bring the bag to the next person on the list.
            ​Not all participants know each other, so it contributes enormously
            to a sense of community in the neighbourhood.
          </Typography>
          <Typography component="p">
            ​ Want to join? We’d love to have you!{" "}
            <a href="./loops/find">Check our map</a> to find one in your
            neighbourhood and sign up. No active Loop to join in your area yet?
            We help you set one up! Joining is free and open to everyone.
          </Typography>
          <Typography component="p">
            This idea started in Amsterdam during the first lockdown. And it
            worked so well, soon other cities followed suit, and it started to
            snowball. By now there are over 410 active loops in the Netherlands,
            with a total of 15.000 people joining. And this is not just densely
            populated areas, the system works everywhere! Because of our
            guidance, support and community building efforts, this local
            initiative grew into the powerful movement it is today. Together we
            have saved thousands of kilo’s of clothing, neighbours got to know
            each other, and we created real behavioural change towards our
            textile consumption. And all of this is fun and super Corona-proof!
          </Typography>
          <Typography component="p">
            Please join the movement, because if you buy only six items per year
            less than you normally would, you save about 40 kilos of CO’2
            emissions: enough for one car to drive from Amsterdam to Paris. We
            want to reach 1 million swappers within the next 5 years. That saves
            as much CO2 emissions as that same car driving around the entire
            world 5.000 times. You are all welcome to try it right now: sign up,
            and/or follow us on socials to decide later. We’d like to inspire
            you to stop shopping, and start swapping! Ps: why we use Ikea bags
            you ask? Because we want to use what already exists first. And who
            hasn’t got an Ikea bag laying around at home? (Any other large
            shopper will work!)
          </Typography>
          <Typography component="h3" className={classes.h3}>
            Team:
          </Typography>
          <Typography component="p">
            The Clothing Loop is an independent initiative within the{" "}
            <a href="https://slowfashion.global/" target="_blank">
              Slow Fashion Movement.
            </a>
          </Typography>
          <img src={PressClipping} alt="" style={{ position: "relative" }} />
          <Typography component="p">
            Nichon Glerum is our founder, CEO, spokesperson and living example
            that one can look like a million bucks in 100% second hand clothes.
          </Typography>
          <Typography component="p">
            Giulia Mummolo is responsible for the development of this amazing
            website you are visiting right now.
          </Typography>
          <Typography component="p">
            Mirjam Pennings is sinking her teeth in getting us some funding to
            be able to keep making our impact and a great support on almost any
            subject or activity.
          </Typography>
          <Typography component="p">
            Paloeka de Koning is our fearless intern, Glide app helpdesk wizard
            and overall rockstar jack of all trades.
          </Typography>
          <Typography component="p">
            <img src={TeamImg} alt="" />
            And then there are all the wonderful people that helped us out along
            the way: Lena for her tireless help and support through Slow Fashion
            Movement, Floortje, Eline, Brechtje, Lara, Sophie en Markoesa for
            making version 1.0 run smoothly, Nynke for her app-improving skills,
            Matthijs for the homepage design, Tim, Gilbert, Tom and Pim for
            helping with website development, Eva for all her legal expertise,
            Elma and Wieke for data analyzation, Tana for the bookkeeping magic,
            Anke for the fun filming, Nikita for the brilliant edit, Team What
            Design can Do and Impact Hub for all the fun, guidance and support,
            Erik for the coaching and last but definitely not least: all the
            volunteers that have set up their local Loops and ran with it.
          </Typography>
          <Typography component="p">Thank you!</Typography>
        </div>
      </div>
    </>
  );
};

export default About;
