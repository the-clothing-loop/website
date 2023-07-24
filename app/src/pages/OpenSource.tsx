import {
  IonBackButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonIcon,
  IonItem,
  IonItemDivider,
  IonItemGroup,
  IonList,
  IonPage,
  IonText,
  IonTitle,
  IonToolbar,
} from "@ionic/react";
import { useTranslation } from "react-i18next";
import OpenSourceLicenses from "../../public/open_source_licenses.json";
import { openOutline } from "ionicons/icons";

export interface OpenSourceLicense {
  name: string;
  modules: Array<string>;
}

function ReadLicenses(): Array<OpenSourceLicense> {
  let licenses: Array<OpenSourceLicense> = [];
  console.log(OpenSourceLicenses);
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
          <IonList>
            {ReadLicenses().map((license) => (
              <LicenseItem licenseItem={license} />
            ))}
          </IonList>
        </div>
      </IonContent>
    </IonPage>
  );
}

function LicenseItem(props: { licenseItem: OpenSourceLicense }) {
  return (
    <IonItemGroup>
      <IonItemDivider sticky>{props.licenseItem.name}</IonItemDivider>

      {props.licenseItem.modules.map((module) => (
        <IonItem>
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
