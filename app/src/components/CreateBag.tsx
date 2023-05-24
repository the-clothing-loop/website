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
  IonText,
  IonTitle,
  IonToolbar,
  SelectChangeEventDetail,
  useIonToast,
} from "@ionic/react";

import type { IonSelectCustomEvent, IonModalCustomEvent } from "@ionic/core";
import { add, checkmarkCircle, ellipse, remove } from "ionicons/icons";
import {
  FormEvent,
  RefObject,
  SetStateAction,
  useContext,
  useState,
} from "react";
import { bagColors, bagPut, UID } from "../api";
import { StoreContext } from "../Store";
import { OverlayEventDetail } from "@ionic/react/dist/types/components/react-component-lib/interfaces";
import toastError from "../../toastError";
import { useTranslation } from "react-i18next";

export default function CreateBag({
  didDismiss,
  modal,
}: {
  modal: RefObject<HTMLIonModalElement>;
  didDismiss?: (e: IonModalCustomEvent<OverlayEventDetail<any>>) => void;
}) {
  const { t } = useTranslation();
  const { bags, chainUsers, route, chain, authUser } = useContext(StoreContext);
  const [bagNumber, setBagNumber] = useState("");
  const [bagColor, setBagColor] = useState(bagColors[2]);
  const [bagHolder, setBagHolder] = useState<UID | null>(null);
  const [error, setError] = useState("");
  const [present] = useIonToast();

  function modalInit() {
    let highestNumber = 0;
    setError("");
    bags.forEach((bag) => {
      let bagNumber = parseInt(bag.number);
      if (!isNaN(bagNumber)) {
        if (bagNumber > highestNumber) {
          highestNumber = bagNumber;
        }
      }
    });
    highestNumber++;
    setBagNumber(highestNumber + "");
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
    if (bags.find((b) => b.number === bagNumber)) {
      setError("number");
      console.warn("bag number already exists");
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
      toastError(present, err);
    }
  }
  function handleChangeBagNumber(e: FormEvent<HTMLIonInputElement>) {
    const value = (e.target as any).value;
    setBagNumber(value);
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
            <IonButton onClick={cancel}>{t("Cancel")}</IonButton>
          </IonButtons>
          <IonTitle>{t("createBag")}</IonTitle>
          <IonButtons slot="end">
            <IonButton onClick={create} color={!error ? "primary" : "danger"}>
              {t("create")}
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <IonList>
          <IonItem lines="none">
            <IonLabel className="ion-text-wrap">
              {t("theNextBagNumberIsAutomaticallySelected")}
            </IonLabel>
          </IonItem>
          <IonItem
            lines="none"
            color={error === "number" ? "danger" : undefined}
          >
            <IonLabel slot="start">{t("bagNumber")}</IonLabel>
            <IonInput
              type="text"
              slot="end"
              className="ion-text-right"
              value={bagNumber}
              onChange={handleChangeBagNumber}
            />
          </IonItem>
          <IonItem lines="none">
            <IonLabel>
              {t("bagColor")}
              <div className="ion-text-center ion-text-wrap">
                {bagColors.map((c) => {
                  const selected = c === bagColor;
                  return (
                    <IonButton
                      fill="clear"
                      size="default"
                      key={c}
                      onClick={() => setBagColor(c)}
                      className="bag-color-select-button"
                    >
                      <IonIcon
                        icon={selected ? checkmarkCircle : ellipse}
                        style={{ color: c }}
                        size="large"
                        className="bag-color-select-icon"
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
              label={t("bagHolder") || ""}
              labelPlacement="stacked"
              className="ion-text-bold"
              placeholder={t("selectTheNewBagHolder") || ""}
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
