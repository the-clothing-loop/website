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

const logo = "https://images.clothingloop.org/x512/the_clothing_loop_logo.png";
const CirclesFrame = "https://images.clothingloop.org/0x0/circles.png";

export function OnboardingPageOne() {
  const history = useHistory();
  return (
    <IonPage>
      <IonContent>
        <IonImg
          src={logo}
          className="tw-w-full tw-px-8 tw-h-auto tw-mx-auto tw-pt-12"
        />

        <div className="tw-flex tw-justify-center">
          <h1
            className="tw-text-secondary tw-fixed tw-inset-y-[45%] tw-font-serif tw-font-bold tw-text-accent tw-text-7xl tw-md:text-9xl tw-mb-8 tw-rtl:text-end"
            dir="ltr"
          >
            Swap, <br />
            <IonText className="tw-text-stroke-accent">don't shop</IonText>
          </h1>
        </div>
        <div className="tw-bg-primary-shade tw-fixed tw-bottom-0 tw-h-[45%] tw-w-full -tw-z-10" />
        <IonImg src={CirclesFrame} className="tw-fixed tw-bottom-0" />

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
