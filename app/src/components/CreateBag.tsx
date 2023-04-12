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
import { bagColors, bagPut, UID } from "../api";
import { StoreContext } from "../Store";
import { OverlayEventDetail } from "@ionic/react/dist/types/components/react-component-lib/interfaces";

export default function CreateBag({
  didDismiss,
  modal,
}: {
  modal: RefObject<HTMLIonModalElement>;
  didDismiss?: (e: IonModalCustomEvent<OverlayEventDetail<any>>) => void;
}) {
  const { bags, chainUsers, route, chain, authUser } = useContext(StoreContext);
  const [bagNumber, setBagNumber] = useState(0);
  const [bagColor, setBagColor] = useState(bagColors[2]);
  const [bagHolder, setBagHolder] = useState<UID | null>(null);
  const [error, setError] = useState("");

  function modalInit() {
    let highestNumber = 0;
    bags.forEach((bag) => {
      if (bag.number > highestNumber) {
        highestNumber = bagNumber;
      }
    });
    setBagNumber(highestNumber + 1);
  }

  function cancel() {
    modal.current?.dismiss();
  }
  async function create() {
    if (!bagHolder) {
      setError("holder");
      return;
    }

    // validate that bag number does not already exist
    if (bags.find((b) => b.number === bagNumber) || bagNumber < 1) {
      setError("number");
      console.warn("bag number already exists or is below zero");
      return;
    }

    try {
      await bagPut({
        chain_uid: chain!.uid,
        user_uid: authUser!.uid,
        holder_uid: bagHolder,
        number: bagNumber,
        color: bagColor,
      });

      setError("");

      modal.current?.dismiss("", "confirm");
    } catch (err: any) {
      setError(err.status);
    }
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
    <IonModal
      ref={modal}
      onIonModalWillPresent={modalInit}
      onIonModalDidDismiss={didDismiss}
    >
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonButton onClick={cancel}>Cancel</IonButton>
          </IonButtons>
          <IonTitle>Create bag</IonTitle>
          <IonButtons slot="end">
            <IonButton onClick={create} color={!error ? "primary" : "danger"}>
              Create
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
                onClick={() => setBagNumber((n) => (n > 1 ? n - 1 : 0))}
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
