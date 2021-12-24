import React from "react";
import theme from "../util/theme";
import { makeStyles } from "@material-ui/core";
import { useTranslation } from "react-i18next";

//MUI
import Box from "@mui/material/Box";
import Stepper from "@mui/material/Stepper";
import Step from "@mui/material/Step";
import StepLabel from "@mui/material/StepLabel";

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
