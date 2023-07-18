import {
  IonButton,
  IonContent,
  IonFab,
  IonFabButton,
  IonIcon,
  IonImg,
  IonPage,
  IonText,
  IonicSlides,
} from "@ionic/react";
import {
  arrowBack,
  arrowForwardOutline,
  chevronDownCircle,
  compassOutline,
  mapOutline,
} from "ionicons/icons";
import { useState } from "react";
import { Redirect, Route, Switch, useHistory } from "react-router";

export function OnboardingPageOne() {
  const history = useHistory();
  return (
    <IonPage>
      <IonContent color="primary">
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            flexDirection: "column",
            height: "100%",
          }}
        >
          <IonText
            style={{
              textAlign: "center",
              fontWeight: "bold",
              fontSize: 20,
              fontFamily: "'Montserrat'",
              lineHeight: 1.4,
              marginBottom: 40,
            }}
          >
            Welcome to
            <br /> the Clothing Loop's app
          </IonText>
          <IonImg
            style={{
              width: "70%",
              maxWidth: 400,
            }}
            src="https://images.clothingloop.org/426x/paloeka_nichon_landscape.jpg"
          />
          <IonText
            style={{
              textAlign: "center",
              fontWeight: "bold",
              fontSize: 30,
              fontFamily: "'Playfair Display'",
              marginTop: 40,
              marginBottom: 40,
            }}
          >
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
            size="small"
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
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            flexDirection: "column",
            height: "100%",
          }}
        >
          <IonText
            style={{
              textAlign: "center",
              fontWeight: "bold",
              fontSize: 20,
              fontFamily: "'Montserrat'",
              marginBottom: 40,
            }}
          >
            You'll need an account
            <br /> to use this app
          </IonText>
          <IonImg
            style={{
              width: "70%",
              maxWidth: 400,
            }}
            src="https://images.clothingloop.org/600x,jpeg/map_image_3.png"
          />
          <IonText
            style={{
              textAlign: "center",
              fontWeight: "bold",
              fontSize: 26,
              fontFamily: "'Playfair Display'",
              marginTop: 40,
              marginBottom: 40,
            }}
          >
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
            size="small"
            className="ion-margin-bottom"
          >
            <IonIcon icon={arrowBack}></IonIcon>
          </IonFabButton>
        </IonFab>
        <IonFab vertical="bottom" horizontal="end">
          <IonFabButton
            size="small"
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
