import {
  IonButton,
  IonContent,
  IonFab,
  IonFabButton,
  IonIcon,
  IonImg,
  IonPage,
  IonText,
} from "@ionic/react";
import {
  arrowBack,
  arrowForwardOutline,
  compassOutline,
  mapOutline,
} from "ionicons/icons";
import { useHistory } from "react-router";

export function OnboardingPageOne() {
  const history = useHistory();
  return (
    <IonPage>
      <IonContent color="primary">
        <div className="tw-flex tw-justify-center tw-items-center tw-flex-col tw-h-full">
          <IonText className="tw-text-center tw-font-bold tw-text-xl tw-leading-7 tw-font-sans tw-mb-10">
            Welcome to
            <br /> the Clothing Loop's app
          </IonText>
          <IonImg
            className="tw-w-[70%] tw-max-w-[400px]"
            src="https://images.clothingloop.org/426x/paloeka_nichon_landscape.jpg"
          />
          <IonText className="tw-text-center tw-font-bold tw-text-3xl tw-leading-10 tw-font-serif tw-my-10">
            Locate bags
            <br /> and pass them on!
          </IonText>
          <IonButton
            shape="round"
            color="danger"
            target="_blank"
            href="https://www.clothingloop.org/about"
          >
            Who are we?
            <IonIcon icon={compassOutline} className="ion-margin-start" />
          </IonButton>
        </div>

        <IonFab vertical="bottom" horizontal="end">
          <IonFabButton
            className="ion-margin-bottom"
            color="light"
            onClick={() => {
              history.push("/onboarding/2");
            }}
          >
            <IonIcon icon={arrowForwardOutline}></IonIcon>
          </IonFabButton>
        </IonFab>
      </IonContent>
    </IonPage>
  );
}

export function OnboardingPageTwo() {
  const history = useHistory();
  return (
    <IonPage>
      <IonContent fullscreen color="secondary">
        <div className="tw-flex tw-justify-center tw-items-center tw-flex-col tw-h-full">
          <IonText className="tw-text-center tw-font-bold tw-text-xl tw-leading-7 tw-font-sans tw-mb-10">
            You'll need an account
            <br /> to use this app
          </IonText>
          <IonImg
            className="tw-w-[70%] tw-max-w-[400px]"
            src="https://images.clothingloop.org/600x,jpeg/map_image_3.png"
          />
          <IonText className="tw-text-center tw-font-bold tw-text-[26px] tw-font-serif tw-my-10">
            If you haven't already,
            <br /> find a loop first!
          </IonText>
          <IonButton
            shape="round"
            color="warning"
            target="_blank"
            href="https://www.clothingloop.org/loops/find"
          >
            Map
            <IonIcon icon={mapOutline} className="ion-margin-start" />
          </IonButton>
        </div>
        <IonFab vertical="bottom" horizontal="start">
          <IonFabButton
            color="clear"
            onClick={() => history.goBack()}
            className="ion-margin-bottom"
          >
            <IonIcon icon={arrowBack}></IonIcon>
          </IonFabButton>
        </IonFab>
        <IonFab vertical="bottom" horizontal="end">
          <IonFabButton
            color="light"
            onClick={() => history.push("/onboarding/3")}
            className="ion-margin-bottom"
          >
            <IonIcon icon={arrowForwardOutline}></IonIcon>
          </IonFabButton>
        </IonFab>
      </IonContent>
    </IonPage>
  );
}
