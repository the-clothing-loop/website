import { Link } from "react-router-dom";
import { useContext, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

// Material UI
import { Typography, Button } from "@mui/material";
import { makeStyles } from "@mui/styles";

import theme from "../../util/theme";

//Resources
import Img from "../../images/Denise.png";
import { TwoColumnLayout } from "../Layouts";
import { AuthContext } from "../AuthProvider";
import { Box } from "@mui/system";

const AdminControlsNav = () => {
  const { t } = useTranslation();

  const classes = makeStyles(theme as any)();
  const { authUser } = useContext(AuthContext);

  return (
    <div>
      {authUser ? (
        <TwoColumnLayout img={Img}>
          <Box sx={{ padding: 8 }}>
            <Typography variant="h3" className={classes.pageTitle}>
              {`Hello, ${authUser?.name}`}
            </Typography>
            <div className={classes.pageDescription}>
              <Typography component="p" className={classes.p}>
                {t("thankYouForBeingHere")}
              </Typography>
            </div>

            <Box sx={{ textAlign: "center", marginTop: 8 }}>
              <Button
                color="inherit"
                className={classes.button}
                sx={{ minWidth: 200 }}
                component={Link}
                to="/loops"
              >
                {t("viewLoops")}
              </Button>

              <Link
                className={classes.underlinedLink}
                target="_blank"
                to={{
                  pathname:
                    "https://drive.google.com/drive/folders/1iMJzIcBxgApKx89hcaHhhuP5YAs_Yb27",
                }}
              >
                {t("goToTheToolkitFolder")}
              </Link>
            </Box>
          </Box>
        </TwoColumnLayout>
      ) : null}
    </div>
  );
};

export default AdminControlsNav;
