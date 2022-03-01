import { Helmet } from "react-helmet";

//MUI
import {
  Typography,
  makeStyles,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Grid,
} from "@material-ui/core";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

//Project Resources
import theme from "../util/theme";
import styles from "./FAQ.module.css";

const FAQ = () => {
  const classes = makeStyles(theme as any)();

  return (
    <>
      <Helmet>
        <title>The Clothing Loop | FAQ's</title>
        <meta name="description" content="frequently asked questions" />
      </Helmet>

      <div className={styles.faqWrapper}>
        <Grid container spacing={0}>
          <Grid item sm={12} md={6} >
            <div className={styles.faqSection}>
              <Typography component="h1" className={classes.pageTitle}>
                {"FAQ for Participants"}
              </Typography>
              <Accordion
                classes={{
                  root: classes.MuiAccordionRoot,
                }}
              >
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon />}
                  aria-controls="panel1a-content"
                  id="panel1a-header"
                >
                  <Typography className={classes.AccordionTypographyRoot}>
                    Are there rules on how much you can take out, and do you
                    have to donate the same amount of clothes as you take out?
                  </Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography>
                    No, there are no rules here. Sometimes you take a bit more,
                    sometimes you give more. Please don't add clothes to the
                    bags that aren't of good quality, just to add something!
                    It's better to have a bag half full of treasures, than to
                    have a full bag that is of less quality.
                  </Typography>
                </AccordionDetails>
              </Accordion>
              <Accordion
                classes={{
                  root: classes.MuiAccordionRoot,
                }}
              >
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon />}
                  aria-controls="panel1a-content"
                  id="panel1a-header"
                >
                  <Typography className={classes.AccordionTypographyRoot}>
                    Can all sizes of clothing be in the same bag?
                  </Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography>
                    Mixed bags work perfectly well usually, as sizes vary per
                    brand and proportions are different as well. But this only
                    works within a certain width. We recommend having a mix of
                    items from size 36 - 42 (S, M and L) and starting a new
                    Clothing Loop for smaller or bigger sizes.
                  </Typography>
                </AccordionDetails>
              </Accordion>
              <Accordion
                classes={{
                  root: classes.MuiAccordionRoot,
                }}
              >
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon />}
                  aria-controls="panel1a-content"
                  id="panel1a-header"
                >
                  <Typography className={classes.AccordionTypographyRoot}>
                    How to avoid “Finders keepers, losers weepers”?
                  </Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography>
                    There are no guarantees that you will find something that
                    you like. Sometimes a few bags will pass your house that may
                    not have an item for you. But remember: finding one dream
                    item is more worth than having 10 items in your wardrobe
                    that you don't wear. And making someone else very happy with
                    something that was collecting dust in your wardrobe is also
                    a significant (and fun!) part of the Clothing Loop
                    mentality!
                  </Typography>
                </AccordionDetails>
              </Accordion>
              <Accordion
                classes={{
                  root: classes.MuiAccordionRoot,
                }}
              >
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon />}
                  aria-controls="panel1a-content"
                  id="panel1a-header"
                >
                  <Typography className={classes.AccordionTypographyRoot}>
                    What to do with bulky clothes (like winter coats) that don't
                    fit in the bag?
                  </Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography>
                    Big items can be photographed and shared via the
                    communication channel, or through the Glide app. In a
                    private message, people can respond and organize pick up.
                  </Typography>
                </AccordionDetails>
              </Accordion>
              <Accordion
                classes={{
                  root: classes.MuiAccordionRoot,
                }}
              >
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon />}
                  aria-controls="panel1a-content"
                  id="panel1a-header"
                >
                  <Typography className={classes.AccordionTypographyRoot}>
                    Can I put shoes in the bag as well?
                  </Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography>
                    The short answer is yes, but keep in mind: shoes are more
                    difficult to pass along than clothes. There are many more
                    sizes, and they show wear a lot quicker than garments. So
                    please be very selective with shoes! Only add “as good as
                    new” pairs, and have no more than 2 pairs per bag.
                  </Typography>
                </AccordionDetails>
              </Accordion>
            </div>
          </Grid>
          <Grid item sm={12} md={6}>
            <div className={styles.faqSection}>
              <Typography component="h1" className={classes.pageTitle}>
                {"FAQ for Loop Hosts"}
              </Typography>
              <Accordion
                classes={{
                  root: classes.MuiAccordionRoot,
                }}
              >
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon />}
                  aria-controls="panel1a-content"
                  id="panel1a-header"
                >
                  <Typography className={classes.AccordionTypographyRoot}>
                    {" "}
                    How can I start using the app?
                  </Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography>
                    You can copy the app and use it within your group. You only
                    have to fill in the address list in our downloadable
                    template. It is super easy! We created a video tutorial and
                    slide deck to help you get started. Please get in touch here
                    if you still run into trouble!
                  </Typography>
                </AccordionDetails>
              </Accordion>
              <Accordion
                classes={{
                  root: classes.MuiAccordionRoot,
                }}
              >
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon />}
                  aria-controls="panel1a-content"
                  id="panel1a-header"
                >
                  <Typography className={classes.AccordionTypographyRoot}>
                    {" "}
                    Are there graphic templates we can use?
                  </Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography>
                    Absolutely, we made you a folder where you can find logo's
                    templates, manuals and all. Use as many as you like!
                  </Typography>
                </AccordionDetails>
              </Accordion>
              <Accordion
                classes={{
                  root: classes.MuiAccordionRoot,
                }}
              >
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon />}
                  aria-controls="panel1a-content"
                  id="panel1a-header"
                >
                  <Typography className={classes.AccordionTypographyRoot}>
                    {" "}
                    Introducing a “Ghost rider” in the Loop
                  </Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography>
                    Once your Loop is ongoing for a while, you may want to
                    change things up a little bit! You can then introduce a
                    “ghost rider” bag that travels in the other direction, so
                    all of a sudden you have other people before you in the
                    route, and also other styles in the bag. If you do so,
                    please make people aware that they shouldn't put any items
                    in the “ghost rider” bag that they have previously taken out
                    of a regular bag. And keep the number of ghost rider bags
                    limited to 1 or 2, to keep it special and also simple.
                  </Typography>
                </AccordionDetails>
              </Accordion>
              <Accordion
                classes={{
                  root: classes.MuiAccordionRoot,
                }}
              >
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon />}
                  aria-controls="panel1a-content"
                  id="panel1a-header"
                >
                  <Typography className={classes.AccordionTypographyRoot}>
                    How to manage a large group of people in the communication
                    channel?
                  </Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography>
                    Especially when groups get bigger, it is important to make
                    sure people aren't bombarded with (irrelevant) messages. You
                    can set up some rules for what should and shouldn't be
                    shared via the group app. For example:
                    <br />
                    <br />
                    <span>Yes,</span> in the app:
                    <ul>
                      <li>
                        Selfies of nice things you took from the bag or nice
                        things that you are putting in
                      </li>
                      <li>Compliments to others</li>
                      <li>Logistics and organizational relevant updates</li>
                    </ul>
                    <span>No,</span> not in the app:
                    <ul>
                      <li>
                        Everything unrelated to the Clothing Loop (requests for
                        surveys, invites for new groups, Fund raising, memes,
                        etc). If you want to ask everyone's input on something,
                        use a polling app like LouLou instead
                      </li>
                    </ul>
                  </Typography>
                </AccordionDetails>
              </Accordion>
              <Accordion
                classes={{
                  root: classes.MuiAccordionRoot,
                }}
              >
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon />}
                  aria-controls="panel1a-content"
                  id="panel1a-header"
                >
                  <Typography className={classes.AccordionTypographyRoot}>
                    What if I no longer have time to manage the Clothing Loop I
                    started?
                  </Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography>
                    Use the group! Ask if someone else wants to take over and
                    host the loop.
                  </Typography>
                </AccordionDetails>
              </Accordion>
              <Accordion
                classes={{
                  root: classes.MuiAccordionRoot,
                }}
              >
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon />}
                  aria-controls="panel1a-content"
                  id="panel1a-header"
                >
                  <Typography className={classes.AccordionTypographyRoot}>
                    What if someone wants to join but lives too far away?
                  </Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography>
                    If someone signed up for your Loop but lives too far outside
                    of your Loop area, it is up to you to decide if he/she/them
                    may join. One thing you can do to decrease the distance
                    between addresses, is to ask that person to find other
                    participants between their area and the original Loop
                    location.{" "}
                  </Typography>
                </AccordionDetails>
              </Accordion>
              <Accordion
                classes={{
                  root: classes.MuiAccordionRoot,
                }}
              >
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon />}
                  aria-controls="panel1a-content"
                  id="panel1a-header"
                >
                  <Typography className={classes.AccordionTypographyRoot}>
                    What is an ideal group size?
                  </Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography>
                    We'd recommend having a minimum of 20 people in a group:
                    after 20 addresses you usually do not recognize anything in
                    the bag anymore, so you can keep swapping. There is no real
                    maximum, it is up to you what still works! In the
                    Netherlands a loop is on average 45 people. But there are
                    loops running smoothly with 130 people!
                  </Typography>
                </AccordionDetails>
              </Accordion>
              <Accordion
                classes={{
                  root: classes.MuiAccordionRoot,
                }}
              >
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon />}
                  aria-controls="panel1a-content"
                  id="panel1a-header"
                >
                  <Typography className={classes.AccordionTypographyRoot}>
                    What to do if the Clothing Loop doesn't work well?
                  </Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography>
                    If the quality of the clothing isn't high enough, people
                    might leave the Loop. Make sure that everyone shares the
                    responsibility for only adding good quality items. <br />
                    <br />
                    Do you see anything that shouldn't be in the Loop? Take it
                    out and donate it to a clothing container. This way, it can
                    still be recycled. If in doubt, ask the person next to you
                    if he/she agrees and decide then.
                    <br />
                    <br />A fabric shaver can extend the lifetime of a clothing
                    item enormously! You can share this advice within your
                    community. <br />
                    <br />
                    And last but not least, set a good example yourself; share
                    some nice photos and encourage others to do the same!
                  </Typography>
                </AccordionDetails>
              </Accordion>
            </div>
          </Grid>
        </Grid>
      </div>
    </>
  );
};

export default FAQ;
