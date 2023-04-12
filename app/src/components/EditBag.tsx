import {
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonIcon,
  IonInput,
  IonItem,
  IonLabel,
  IonList,
  IonModal,
  IonSelect,
  IonSelectOption,
  IonTitle,
  IonToolbar,
  SelectChangeEventDetail,
} from "@ionic/react";

import type { IonSelectCustomEvent, IonModalCustomEvent } from "@ionic/core";
import { add, checkmarkCircle, ellipse, remove } from "ionicons/icons";
import { FormEvent, RefObject, useContext, useState } from "react";
import { Bag, bagColors, UID } from "../api";
import { StoreContext } from "../Store";
import { OverlayEventDetail } from "@ionic/react/dist/types/components/react-component-lib/interfaces";

export default function CreateBag({
  didDismiss,
  bag,
  otherBagNumbers,
  modal,
}: {
  bag: Bag;
  otherBagNumbers: number[];
  modal: RefObject<HTMLIonModalElement>;
  didDismiss?: (e: IonModalCustomEvent<OverlayEventDetail<any>>) => void;
}) {
  const { bags, chainUsers, route, chain } = useContext(StoreContext);
  const [bagNumber, setBagNumber] = useState(bag.number);
  const [bagColor, setBagColor] = useState(bag.color);
  const [bagHolder, setBagHolder] = useState<UID>(bag.user_uid);
  const [error, setError] = useState("");

  function cancel() {
    modal.current?.dismiss();
  }
  function save() {
    let bag: Bag = {
      number: bagNumber,
      color: bagColor,
      chain_uid: chain!.uid,
      user_uid: bagHolder,
    };

    // validate that bag number does not already exist
    if (otherBagNumbers.find((bNo) => bNo === bagNumber) || bagNumber < 1) {
      setError("number");
      console.warn("bag number already exists or is below zero");
      return;
    }

    setError("");

    modal.current?.dismiss("", "confirm");
  }
  function handleInputBagNumber(e: FormEvent<HTMLIonInputElement>) {
    let value = (e.target as any).value;
    setBagNumber(parseInt(value, 10));
  }
  function handleSelectBagHolder(
    e: IonSelectCustomEvent<SelectChangeEventDetail<any>>
  ) {
    let userUID = e.detail.value;

    const user = chainUsers.find((u) => u.uid === userUID);
    if (!user || !chain) return;

    setBagHolder(user.uid);
  }
  return (
    <IonModal ref={modal} onIonModalDidDismiss={didDismiss}>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonButton onClick={cancel}>Cancel</IonButton>
          </IonButtons>
          <IonTitle>Edit bag</IonTitle>
          <IonButtons slot="end">
            <IonButton onClick={save} color={!error ? "primary" : "danger"}>
              Save
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <IonList>
          <IonItem lines="none">
            <IonLabel className="ion-text-wrap">
              The next bag number is automatically selected
            </IonLabel>
          </IonItem>
          <IonItem lines="none">
            <IonLabel slot="start">Bag Number</IonLabel>
            <IonInput
              className="ion-text-right"
              type="number"
              value={bagNumber}
              onChange={handleInputBagNumber}
              color={error === "number" ? "danger" : undefined}
            ></IonInput>

            <IonButtons slot="end" className="ion-margin-start">
              <IonButton
                shape="round"
                onClick={() => setBagNumber((n) => n + 1)}
              >
                <IonIcon icon={add}></IonIcon>
              </IonButton>
              <IonButton
                shape="round"
                onClick={() => setBagNumber((n) => (n < 0 ? n - 1 : 0))}
              >
                <IonIcon icon={remove}></IonIcon>
              </IonButton>
            </IonButtons>
          </IonItem>
          <IonItem lines="none">
            <IonLabel>
              Bag Color
              <div className="ion-text-center ion-text-wrap">
                {bagColors.map((c) => {
                  const selected = c === bagColor;
                  return (
                    <IonButton
                      fill="clear"
                      size="default"
                      key={c}
                      onClick={() => setBagColor(c)}
                    >
                      <IonIcon
                        icon={selected ? checkmarkCircle : ellipse}
                        style={{ color: c }}
                        size="large"
                      />
                    </IonButton>
                  );
                })}
              </div>
            </IonLabel>
          </IonItem>
          <IonItem
            lines="none"
            color={error === "holder" ? "danger" : undefined}
          >
            <IonSelect
              label="Bag Holder"
              labelPlacement="stacked"
              className="ion-text-bold"
              placeholder="Who currently holds the bag"
              value={bagHolder}
              color={error === "holder" ? "danger" : undefined}
              onIonChange={handleSelectBagHolder}
            >
              {route.map((r) => {
                let user = chainUsers.find((u) => u.uid === r);
                if (!user) return null;
                return (
                  <IonSelectOption key={user.uid} value={user.uid}>
                    {user.name}
                  </IonSelectOption>
                );
              })}
            </IonSelect>
          </IonItem>
        </IonList>
      </IonContent>
    </IonModal>
  );
}
