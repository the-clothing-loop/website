import {
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@mui/material";
import { ExpandMore as ExpandMoreIcon } from "@mui/icons-material";
import { makeStyles } from "@mui/styles";

//Project Resources
import theme from "../../util/theme";

const AccordionFaq = ({ question, answer }: any) => {
  const classes = makeStyles(theme as any)();

  return (
    <div>
      <Accordion classes={{ root: classes.MuiAccordionRoot }}>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="panel1a-content"
          id="panel1a-header"
        >
          <Typography className={classes.AccordionTypographyRoot}>
            {question}
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Typography dangerouslySetInnerHTML={{__html: answer}}></Typography>
        </AccordionDetails>
      </Accordion>
    </div>
  );
};

export default AccordionFaq;
