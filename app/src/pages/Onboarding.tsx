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
import { arrowBack, arrowForwardOutline, mapOutline } from "ionicons/icons";
import { useHistory } from "react-router";

export function OnboardingPageOne() {
  const history = useHistory();

  return (
    <IonPage>
      <IonContent>
        <div className="tw-absolute tw-top-1/4 tw-translate-x-0 -tw-translate-y-1/2 tw-w-full">
          <IonImg
            src="/v2_logo_white.png"
            className="tw-w-52 md:tw-w-72 tw-hidden dark:tw-block tw-mx-auto"
          />
          <IonImg
            src="/v2_logo_black.png"
            className="tw-w-52 md:tw-w-72 dark:tw-hidden tw-mx-auto"
          />
        </div>

        <h1
          className="tw-z-10 tw-block tw-absolute tw-inset-x tw-top-[55%] -tw-mt-20 md:-tw-mt-36 tw-px-4 md:tw-pl-[4%] tw-text-secondary dark:tw-text-dark tw-font-serif tw-font-bold tw-text-accent tw-text-7xl md:tw-text-9xl rtl:tw-text-end"
          dir="ltr"
        >
          Swap, <br />
          <span className="tw-text-stroke-accent dark:tw-text-stroke-dark">
            don't shop
          </span>
        </h1>
        <div className="tw-bg-green-contrast dark:tw-bg-primary tw-fixed tw-bottom-0 tw-h-[45%] tw-w-full -tw-z-10" />
        <div className="tw-absolute tw-overflow-hidden tw-inset-0 -tw-z-10">
          <IonIcon
            aria-hidden="true"
            icon="/v2_o_pattern_green.svg"
            style={{ fontSize: 400 }}
            className="tw-absolute -tw-left-28 -tw-bottom-[170px] tw-text-green tw-opacity-70"
          />
        </div>
        <IonFab
          vertical="bottom"
          horizontal="end"
          className="md:tw-mr-20 md:tw-mb-20"
        >
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
            src="https://images.clothingloop.org/600x,jpeg/map_image_5.jpg"
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
        <IonFab
          vertical="bottom"
          horizontal="start"
          className="md:tw-ml-20 md:tw-mb-20"
        >
          <IonFabButton
            color="clear"
            onClick={() => history.replace("/onboarding/1")}
            className="ion-margin-bottom"
          >
            <IonIcon icon={arrowBack}></IonIcon>
          </IonFabButton>
        </IonFab>
        <IonFab
          vertical="bottom"
          horizontal="end"
          className="md:tw-mr-20 md:tw-mb-20"
        >
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
