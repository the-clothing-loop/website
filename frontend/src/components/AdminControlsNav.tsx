import { Link } from "react-router-dom";
import { useContext } from "react";
import { useTranslation } from "react-i18next";

// Material UI
import Typography from "@material-ui/core/Typography";
import Button from "@material-ui/core/Button";
import { makeStyles } from "@material-ui/core";
import theme from "../util/theme";

//Resources
import Img from "../images/Denise.jpg";
import { TwoColumnLayout } from "../components/Layouts";
import { AuthContext } from "../components/AuthProvider";

const AdminControlsNav = () => {
  const { t } = useTranslation();

  const classes = makeStyles(theme as any)();
  const { userData } = useContext(AuthContext);

  return (
    <div>
      {userData ? (
        <TwoColumnLayout img={Img}>
          <div className="admin-nav-content">
            <Typography variant="h3" className={classes.pageTitle}>
              {`Hello, ${userData?.name}`}
            </Typography>
            <div className={classes.pageDescription}>
              <Typography component="p" className={classes.p}>
                Use the options below to navigate through the admin panel.
              </Typography>
            </div>

            <div className="admin-controls-nav">
              {userData?.role === "chainAdmin" ? (
                <div className="admin-nav-btn">
                  <Button
                    color="inherit"
                    className={classes.button}
                    component={Link}
                    to={`/loops/${userData.chainId}/members`}
                  >
                    {t("viewLoop")}
                  </Button>
                  <Button
                    color="inherit"
                    className={classes.button}
                    component={Link}
                    to={`/loops/${userData.chainId}/edit`}
                  >
                    {t("editLoop")}
                  </Button>
                </div>
              ) : null}

              {userData?.role === "admin" ? (
                <div className="admin-nav-btn">
                  <Button
                    color="inherit"
                    className={classes.button}
                    component={Link}
                    to="/loops"
                  >
                    view loops
                  </Button>
                </div>
              ) : null}

              <Button
                color="inherit"
                className={classes.button}
                onClick={() =>
                  (window.location.href =
                    "https://drive.google.com/drive/folders/1iMJzIcBxgApKx89hcaHhhuP5YAs_Yb27")
                }
              >
                {t("download")}
              </Button>
            </div>
          </div>
        </TwoColumnLayout>
      ) : null}
    </div>
  );
};

export default AdminControlsNav;
