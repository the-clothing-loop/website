//MUI
import {
  Typography,
  makeStyles,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@material-ui/core";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

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
          <Typography>{answer}</Typography>
        </AccordionDetails>
      </Accordion>
    </div>
  );
};

export default AccordionFaq;
