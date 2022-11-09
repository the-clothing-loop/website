import { Accordion, AccordionSummary, AccordionDetails } from "@mui/material";
import { makeStyles } from "@mui/styles";

//Project Resources
import theme from "../util/theme";

const AccordionFaq = ({ question, answer }: any) => {
  const classes = makeStyles(theme as any)();

  return (
    <div>
      <Accordion classes={{ root: classes.MuiAccordionRoot }}>
        <AccordionSummary
          expandIcon={<span className="feather feather-chevron-down"></span>}
          aria-controls="panel1a-content"
          id="panel1a-header"
        >
          <p className={classes.AccordionTypographyRoot}>{question}</p>
        </AccordionSummary>
        <AccordionDetails>
          <p dangerouslySetInnerHTML={{ __html: answer }}></p>
        </AccordionDetails>
      </Accordion>
    </div>
  );
};

export default AccordionFaq;
