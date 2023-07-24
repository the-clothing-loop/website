import {
  IonBackButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonIcon,
  IonInfiniteScroll,
  IonInfiniteScrollContent,
  IonItem,
  IonItemDivider,
  IonItemGroup,
  IonList,
  IonLoading,
  IonPage,
  IonSkeletonText,
  IonText,
  IonTitle,
  IonToolbar,
} from "@ionic/react";
import { useTranslation } from "react-i18next";
import OpenSourceLicenses from "../../public/open_source_licenses.json";
import { openOutline } from "ionicons/icons";
import { useEffect, useMemo, useState } from "react";
import { OpenSourceLicense, getOpenSouceLicenses } from "../api";

function ReadLicenses(): Array<OpenSourceLicense> {
  let licenses: Array<OpenSourceLicense> = [];
  for (const license in OpenSourceLicenses) {
    licenses.push({
      name: license,
      modules: (OpenSourceLicenses as any)[license],
    });
  }
  return licenses;
}

export default function OpenSource() {
  const { t } = useTranslation();
  const [readLicenses, setReadLicenses] = useState<OpenSourceLicense[]>([]);
  const [page, setPage] = useState(50);

  useEffect(() => {
    getOpenSouceLicenses().then((licenses) => {
      setReadLicenses(licenses.data);
    });
  }, []);

  const shownLicenses = useMemo(() => {
    let result: OpenSourceLicense[] = [];
    let licenseIndex = 0;
    for (let j = 0; j < page; j++) {
      let currentLicense = readLicenses[licenseIndex];
      if (!currentLicense) break;
      let moduleIndex = 0;
      let shownModules: string[] = [];
      while (j < page) {
        let currentModule = currentLicense.modules[moduleIndex];
        if (!currentModule) {
          j++;
          break;
        }
        shownModules.push(currentModule);

        moduleIndex++;
        j++;
      }
      result.push({
        name: currentLicense.name,
        modules: shownModules,
      });

      licenseIndex++;
      j++;
    }
    return result;
  }, [page, readLicenses]);

  return (
    <IonPage>
      <IonHeader translucent>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton>{t("back")}</IonBackButton>
          </IonButtons>
          <IonTitle>{t("openSource")}</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <IonHeader collapse="condense">
          <IonToolbar>
            <IonTitle size="large">{t("openSource")}</IonTitle>
          </IonToolbar>
        </IonHeader>
        <div>
          {shownLicenses.length ? (
            <IonList>
              {shownLicenses.map((license) => (
                <LicenseItem licenseItem={license} key={license.name} />
              ))}
            </IonList>
          ) : (
            <IonList>
              <IonItem>
                <IonSkeletonText animated={true} style={{ width: "80px" }} />
              </IonItem>
            </IonList>
          )}

          <IonInfiniteScroll
            onIonInfinite={(e) => {
              console.log("run onInfiniteScroll");

              setPage((s) => s + 200);
              setTimeout(() => e.target.complete(), 300);
            }}
          >
            <IonInfiniteScrollContent />
          </IonInfiniteScroll>
        </div>
      </IonContent>
    </IonPage>
  );
}

function LicenseItem(props: { licenseItem: OpenSourceLicense }) {
  let items = props.licenseItem.modules;

  return (
    <IonItemGroup>
      <IonItemDivider sticky>{props.licenseItem.name}</IonItemDivider>

      {items.map((module) => (
        <IonItem key={module}>
          {module}
          <a
            target="_blank"
            slot="end"
            href={`https://www.npmjs.com/package/${module}`}
          >
            <IonIcon icon={openOutline} />
          </a>
        </IonItem>
      ))}
    </IonItemGroup>
  );
}
