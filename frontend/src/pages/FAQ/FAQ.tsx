import { Helmet } from "react-helmet";

import { Typography, Grid } from "@mui/material";
import { ExpandMore as ExpandMoreIcon } from "@mui/icons-material";
import { makeStyles } from "@mui/styles";

import AccordionFaq from "../../components/AccordionFaq/AccordionFaq";
import participantsFaq from "./participantsFaq";
import theme from "../../util/theme";
import styles from "./FAQ.module.css";
import { useTranslation } from "react-i18next";

const FAQ = () => {
  const {t} = useTranslation("faq");
  const classes = makeStyles(theme as any)();

  const arrHosts = t("arrHosts", {
    returnObjects: true,
    defaultValue: [],
  }) as {question: string, answer: string}[]

  return (
    <>
      <Helmet>
        <title>The Clothing Loop | FAQ's</title>
        <meta name="description" content="frequently asked questions" />
      </Helmet>

      <div className={styles.faqWrapper}>
        <Grid container spacing={0}>
          <Grid item sm={12} md={6}>
            <div className={styles.faqSection}>
              <Typography component="h1" className={classes.pageTitle}>
                FAQ for Participants
              </Typography>
              {participantsFaq.map((el, index) => (
                <AccordionFaq
                  key={index}
                  question={el.question}
                  answer={el.answer}
                />
              ))}
            </div>
          </Grid>
          <Grid item sm={12} md={6}>
            <div className={styles.faqSection}>
              <Typography component="h1" className={classes.pageTitle}>
                FAQ for Loop Hosts
              </Typography>
              {arrHosts.map((el, index) => (
                <AccordionFaq
                  key={index}
                  question={el.question}
                  answer={el.answer}
                />
              ))}
            </div>
          </Grid>
        </Grid>
      </div>
    </>
  );
};

export default FAQ;
