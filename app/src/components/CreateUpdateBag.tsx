import {
  IonButton,
  IonButtons,
  IonContent,
  IonFabButton,
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
  useIonToast,
} from "@ionic/react";

import type { IonSelectCustomEvent, IonModalCustomEvent } from "@ionic/core";
import { checkmarkCircle, ellipse } from "ionicons/icons";
import { RefObject, useContext, useState } from "react";
import { Bag, bagColors, bagPut, UID } from "../api";
import { StoreContext } from "../Store";
import { OverlayEventDetail } from "@ionic/react/dist/types/components/react-component-lib/interfaces";
import toastError from "../../toastError";
import { useTranslation } from "react-i18next";

export default function CreateUpdateBag({
  bag,
  didDismiss,
  modal,
}: {
  bag: Bag | null;
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
    setError("");
    setBagColor(bag?.color || bagColors[2]);
    setBagHolder(bag?.user_uid || authUser?.uid || null);

    if (bag === null) {
      let highestNumber = 0;
      {
        bags.forEach((bag) => {
          let bagNumber = parseInt(bag.number);
          if (!isNaN(bagNumber)) {
            if (bagNumber > highestNumber) {
              highestNumber = bagNumber;
            }
          }
        });
        highestNumber++;
      }

      setBagNumber(highestNumber + "");
    } else {
      setBagNumber(bag.number);
    }
  }

  function cancel() {
    modal.current?.dismiss();
  }
  async function createOrUpdate() {
    if (!bagHolder) {
      setError("holder");
      return;
    }

    // validate that bag number does not already exist
    if (bags.find((b) => b.id !== bag?.id && b.number === bagNumber)) {
      setError("number");
      console.warn("bag number already exists");
      return;
    }

    let body: Parameters<typeof bagPut>[0] = {
      chain_uid: chain!.uid,
      user_uid: authUser!.uid,
      holder_uid: bagHolder,
      number: bagNumber,
      color: bagColor,
    };
    if (bag) {
      body.bag_id = bag.id;
    }

    try {
      await bagPut(body);

      setError("");

      modal.current?.dismiss("", "confirm");
    } catch (err: any) {
      setError(err.status);
      toastError(present, err);
    }
  }
  function handleSelectBagHolder(
    e: IonSelectCustomEvent<SelectChangeEventDetail<any>>,
  ) {
    let userUID = e.detail.value;

    const user = chainUsers.find((u) => u.uid === userUID);
    if (!user || !chain) return;

    setBagHolder(user.uid);
  }
  function handleSetBagEmoji(emoji: string) {
    const search = " " + emoji;
    if (bagNumber.includes(search)) {
      setBagNumber((s) => s.replace(search, ""));
    } else {
      setBagNumber((s) => s + search);
    }
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
            <IonButton onClick={cancel}>{t("cancel")}</IonButton>
          </IonButtons>
          <IonTitle>{bag ? t("updateBag") : t("createBag")}</IonTitle>
          <IonButtons slot="end">
            <IonButton
              onClick={createOrUpdate}
              color={!error ? "primary" : "danger"}
            >
              {bag ? t("update") : t("create")}
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <IonList>
          <IonItem
            lines="none"
            color={error === "number" ? "danger" : undefined}
          >
            <IonInput
              type="text"
              label={t("bagName")}
              labelPlacement="start"
              max={18}
              spellCheck
              autoCapitalize="words"
              maxlength={18}
              counter
              placeholder=""
              value={bagNumber}
              onFocus={(e) => (e.target as any as HTMLInputElement).select()}
              onIonChange={(e) =>
                setBagNumber(e.detail.value?.toString() || "")
              }
            />
          </IonItem>
          <IonItem lines="none" className="-tw-mt-5">
            {["👻", "🐰"].map((emoji, i) => (
              <IonFabButton
                key={i}
                size="small"
                color={bagNumber.includes(emoji) ? "primary" : "light"}
                onClick={() => handleSetBagEmoji(emoji)}
                className="tw-text-xl"
              >
                {emoji}
              </IonFabButton>
            ))}
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
