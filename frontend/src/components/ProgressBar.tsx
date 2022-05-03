import theme from "../util/theme";
import { useTranslation } from "react-i18next";

import { Box, Stepper, Step, StepLabel } from "@mui/material";
import { makeStyles } from "@mui/styles";

const steps = ["signup", "selectLoopLocation", "confirmation"];

interface IProps {
  activeStep: number;
}

const ProgressBar: React.FC<IProps> = ({ activeStep }) => {
  const classes = makeStyles(theme as any)();
  const { t } = useTranslation();

  return (
    <Box sx={{ width: "100%" }}>
      <Stepper activeStep={activeStep} alternativeLabel>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel
              className={classes.stepLabel}
              StepIconProps={{
                classes: {
                  root: classes.icon,
                  active: classes.activeIcon,
                  completed: classes.completedIcon,
                },
              }}
            >
              {t(label)}
            </StepLabel>
          </Step>
        ))}
      </Stepper>
    </Box>
  );
};

export default ProgressBar;
