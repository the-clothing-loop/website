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
    <main className="tw-pt-20">
      {authUser && (
        <TwoColumnLayout img="/images/Denise.png">
          <div className="tw-pt-32 tw-pl-10 tw-pr-20 tw-flex tw-flex-col tw-items-center tw-justify-center tw-text-center">
            <h3 className="tw-font-serif tw-font-bold tw-text-5xl tw-text-secondary tw-mb-8">{`Hello, ${authUser?.name}`}</h3>
            <p className="tw-mb-6">{t("thankYouForBeingHere")}</p>

            <Link className="tw-btn tw-btn-primary tw-mb-4" to="/loops">
              {t("viewLoops")}
            </Link>

            <Link
              className="tw-btn tw-btn-primary tw-btn-link tw-text-base tw-block"
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
