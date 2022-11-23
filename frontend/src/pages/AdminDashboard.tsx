import { Link } from "react-router-dom";
import { useContext, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
//Resources
import { TwoColumnLayout } from "../components/Layouts";
import { AuthContext } from "../providers/AuthProvider";

export default function AdminDashboard() {
  const { t } = useTranslation();
  const { authUser } = useContext(AuthContext);

  return (
    <main className="pt-10">
      {authUser && (
        <TwoColumnLayout img="/images/Denise.png">
          <div className="pt-32 pl-10 pr-20 flex flex-col items-center justify-center text-center">
            <h3 className="font-serif font-bold text-5xl text-secondary mb-8">{`Hello, ${authUser?.name}`}</h3>
            <p className="mb-6">{t("thankYouForBeingHere")}</p>

            <Link className="btn btn-primary mb-4" to="/loops">
              {t("viewLoops")}
            </Link>

            <Link
              className="btn btn-primary btn-link text-base block"
              target="_blank"
              to={{
                pathname:
                  "https://drive.google.com/drive/folders/1iMJzIcBxgApKx89hcaHhhuP5YAs_Yb27",
              }}
            >
              {t("goToTheToolkitFolder")}
            </Link>
          </div>
        </TwoColumnLayout>
      )}
    </main>
  );
}
