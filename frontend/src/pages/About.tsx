import { Typography } from "@material-ui/core";
import { makeStyles } from "@material-ui/styles";
import theme from "../util/theme";

const About = () => {
  const classes = makeStyles(theme as any)();

  return (
    <div className={classes.legalPagesWrapper}>
      <Typography component="h1" className={classes.pageTitle}>
        {"About The Clothing Loop"}
      </Typography>
      <div className={classes.legalPagesContentWrapper}>
        <Typography component="p">
          The Clothing Loop is an initiative that allows people to easily swap
          clothes with others in their own neighbourhood. It’s fun, free and
          sustainable! The idea is simple: (large) bags filled with clothes​
          travel along a route past all participants in a certain city or
          district.
        </Typography>
        <Typography component="p">
          Do you get the bag ​delivered to your​ home? After of course getting
          acquainted with somebody new from your neighbourhood it’s ​time to
          shop! Take ​items you like, and put back something that is still in
          good condition, but ready for a new owner. If you want, share a photo
          with your latest find in the corresponding app group. Then take the
          bag to the next neighbou​r on the list.
        </Typography>
        <Typography component="p">
          ​Not all participants know each other, so it contributes enormously to
          a group feeling in the neighbourhood. Want to join? We’d love to have
          you! Check our map to find one in your neighbourhood and sign up. No
          active Loop to join in your area yet? We help you set one up! Joining
          is free and open to everyone.
        </Typography>
        <Typography component="p">
          This idea started in Amsterdam during the first lockdown. And it
          worked so well, soon other cities followed suit, and it started to
          snowball. By now there are over 410 active loops in the Netherlands,
          with a total of 15.000 people joining. And this is not just densely
          populated areas, the system works everywhere! Because of our guidance,
          support and community building efforts, this local initiative grew
          into the powerful movement it is today. Together we have saved
          thousands of kilo’s of clothing, facilitated neighbours getting to
          know each other, and created real behavioural change towards our
          textile consumption. And all of this is fun and super Corona-proof!
        </Typography>
        <Typography component="p">
          Please join the movement, because if you buy only six items per year
          less than you normally would, you save about 40 kilos of CO’2
          emissions: enough for one car to drive from Amsterdam to Paris. We
          want to reach 1 million swappers within the next 5 years. That saves
          as much CO2 emissions as that same car driving around the entire world
          5.000 times. You are all welcome to try it right now: sign up, and/or
          follow us on socials to decide later. We’d like to inspire you to stop
          shopping, and start swapping! Ps: why we use Ikea bags you ask?
          Because we want to use what already exists first. And who hasn’t got
          an Ikea bag laying around at home? (Any other large shopper will
          work!)
        </Typography>
        <Typography component="h3" className={classes.h3}>
          {" "}
          Team:
        </Typography>
        <Typography component="p">
          The Clothing Loop is an independent initiative within the Slow Fashion
          Movement.
        </Typography>
        <Typography component="p">
          Nichon Glerum is our founder, CEO, spokesperson and living example
          that one can look like a million bucks in 100% second hand clothes.{" "}
          <br />
          Giulia Mummolo is responsible for the development of this amazing
          website you are visiting right now.
          <br />
          Mirjam Pennings is sinking her teeth in getting us some funding to be
          able to keep making our impact and a great support on almost any
          subject or activity.
          <br />
          Paloeka de Koning is our fearless intern, Glide app helpdesk wizard
          and overall rockstar jack of all trades.
          <br />
          <br />
          And then there is all the wonderful people that helped us out along
          the way: Lena for her tireless help and support through Slow Fashion
          Movement, Floortje, Eline, Brechtje, Lara, Sophie en Markoesa for
          making version 1.0 run smoothly, Nynke for her app-improving skills,
          Matthijs for the homepage design, Tim, Gilbert, Tom and Pim for
          helping with website development, Eva for all her legal expertise,
          Elma and Wieke for data analyzation, Tana for the bookkeeping magic,
          Anke for the fun filming, Nikita for the brilliant edit, Team What
          Design can Do and Impact Hub for all the fun, guidance and support,
          Eric for the coaching and last but definitely not least: all the
          volunteers that have set up their Local loops and ran with it.
          <br />
          <br />
          Thank you!
        </Typography>
      </div>
    </div>
  );
};

export default About;
