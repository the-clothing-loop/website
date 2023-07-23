import {IonBackButton, IonButtons, IonContent, IonHeader, IonPage, IonText, IonToolbar,} from "@ionic/react";
import {useTranslation} from "react-i18next";
import LicenseItem from "../components/LicenseItem";
import OpenSourceLicenses from '../../public/open_source_licenses.json';

export interface OpenSourceLicense {
    name: string
    modules: Array<string>
}

function ReadLicenses(): Array<OpenSourceLicense> {
    let licenses: Array<OpenSourceLicense> = [];
    console.log(OpenSourceLicenses)
    for (const license in OpenSourceLicenses) {
        licenses.push({
            name: license,
            modules: OpenSourceLicenses[license],
        })
    }
    return licenses;
}

export default function OpenSource() {
    const {t} = useTranslation();
    return (
        <IonPage>
            <IonHeader translucent>
                <IonToolbar>
                    <IonButtons slot="start">
                        <IonBackButton>{t("back")}</IonBackButton>
                    </IonButtons>
                </IonToolbar>
            </IonHeader>
            <IonContent className="ion-padding">
                <IonText>
                    {ReadLicenses().map((license) => <LicenseItem licenseItem={license}/>)}
                </IonText>
            </IonContent>
        </IonPage>
    );
}
