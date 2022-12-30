//Resources
import { TwoColumnLayout } from "../components/Layouts";
import { AuthContext } from "../providers/AuthProvider";
//account settings
import { purge } from "../api/user";
//added useHistory for boot out after account deletion
import { Link, useHistory } from "react-router-dom";
import { useContext} from "react";
import { useTranslation } from "react-i18next";

export default function AdminDashboard() {
  const { t } = useTranslation();
  const { authUser } = useContext(AuthContext);

  const history = useHistory(); //added history
  function deleteClicked() {
    //prompt user, if(selection) purge user
    console.log("Delete Clicked");
    if (
      window.confirm(
        "Account Deletion is permanent: proceed?"
      )
    ) {
      purge(authUser?.uid);
      console.log("User");
      history.push("/users/logout");
    }
  }

  return (
    <main className="pt-10">
      {authUser && (
        <TwoColumnLayout img="https://ucarecdn.com/6ac2be4c-b2d6-4303-a5a0-c7283759a8e9/-/resize/x600/-/format/auto/-/quality/smart/denise.png">
          <div className="md:pl-10 md:pr-20 flex flex-col items-center justify-center text-center max-md:mb-10">
            <h3 className="font-serif font-bold text-5xl text-secondary mb-8">{`Hello, ${authUser?.name}`}</h3>
            <p className="mb-6">{t("thankYouForBeingHere")}</p>

            <Link className="btn btn-primary mb-4" to="/loops">
              {t("viewLoops")}
            </Link>

            <Link
              className="btn btn-primary btn-link text-base block mb-4" //added mb-4
              target="_blank"
              to={{
                pathname:
                  "https://drive.google.com/drive/folders/1iMJzIcBxgApKx89hcaHhhuP5YAs_Yb27",
              }}
            >
              {t("goToTheToolkitFolder")}
            </Link>

            {/*container for del-btn set appears at bottom of parent*/}
            <div className="relative align-bottom">
              <button
                className="btn btn-primary bg-red block"
                onClick={deleteClicked}
              >
                {t("Delete User")} {/*replace with translate tag when available*/}
              </button>
            </div>
          </div>
        </TwoColumnLayout>
      )}
    </main>
  );
}
