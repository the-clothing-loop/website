import {
  IonModalCustomEvent,
  OverlayEventDetail,
  IonDatetimeCustomEvent,
  DatetimeChangeEventDetail,
} from "@ionic/core";
import {
  IonModal,
  IonHeader,
  IonToolbar,
  IonButtons,
  IonButton,
  IonTitle,
  IonContent,
  IonList,
  IonItem,
  IonLabel,
  IonDatetimeButton,
  IonDatetime,
  IonSearchbar,
  IonRadioGroup,
  IonRadio,
  IonIcon,
} from "@ionic/react";
import { RefObject, useContext, useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { bagPut } from "../../api/bag";
import { UID } from "../../api/types";
import { StoreContext } from "../../stores/Store";
import IsPaused from "../../utils/is_paused";
import { pauseCircleSharp } from "ionicons/icons";

const MIN_USERS_FOR_SEARCH = 15;

export default function SelectUserModal({
  didDismiss,
  selectedUserUID,
  bagID,
  modal,
}: {
  selectedUserUID: UID;
  bagID: number | null;
  modal: RefObject<HTMLIonModalElement>;
  didDismiss?: (e: IonModalCustomEvent<OverlayEventDetail<any>>) => void;
}) {
  const { chain, chainUsers, route, authUser, setChain, isChainAdmin } =
    useContext(StoreContext);
  const { t, i18n } = useTranslation();

  const [selectedOverride, setSelected] = useState("");
  const [updatedAt, setUpdatedAt] = useState<Date | null>(null);
  const [search, setSearch] = useState("");
  const sortedRoute = useMemo(() => {
    const indexSelected = route.indexOf(selectedUserUID);
    const routeWithIndex = route.map<[string, number]>((r, i) => [r, i]);
    let arr = [...routeWithIndex];
    arr.splice(0, indexSelected);
    let arrTop = [...routeWithIndex];
    arrTop.splice(indexSelected);
    arr.push(...arrTop);
    // console.log("arr", [...arr], "indexSelected", indexSelected);

    if (arr.length > 4) {
      let arrBot = [arr.pop()!, arr.pop()!];
      arrBot.reverse();
      arr.unshift(...arrBot);
      // console.log("arrBot", [...arrBot]);
    }
    return arr;
  }, [selectedUserUID, route, authUser, chainUsers]);

  async function submit(userUID: string) {
    console.info("Select a user for bag","user:", userUID, "bag:", bagID);

    if ((typeof userUID !== "string" || !userUID) && !bagID) return;
    modal.current?.dismiss(userUID, "success");
    await bagPut({
      chain_uid: chain!.uid,
      user_uid: authUser!.uid,
      holder_uid: userUID,
      bag_id: bagID!,
      ...(updatedAt === null
        ? {}
        : {
            updated_at: updatedAt.toISOString(),
          }),
    });
    await setChain(chain?.uid, authUser);
  }

  function handleChangeDatetime(
    e: IonDatetimeCustomEvent<DatetimeChangeEventDetail>,
  ) {
    let datetime = new Date(e.detail.value + "");
    setUpdatedAt(datetime);
  }

  function willPresent() {
    setUpdatedAt(null);
  }

  function _didDismiss(e: IonModalCustomEvent<OverlayEventDetail<any>>) {
    setSelected("");
    if (didDismiss) didDismiss(e);
  }

  let selected = selectedOverride || selectedUserUID;
  return (
    <IonModal
      ref={modal}
      initialBreakpoint={0.5}
      breakpoints={[0, 0.5, 0.75, 1]}
      onIonModalDidDismiss={_didDismiss}
      onIonModalWillPresent={willPresent}
    >
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonButton onClick={() => modal.current?.dismiss(null, "dismiss")}>
              {t("close")}
            </IonButton>
          </IonButtons>
          <IonTitle>{t("changeBagHolder")}</IonTitle>
          <IonButtons slot="end">
            <IonButton onClick={() => submit(selected)}>
              {t("change")}
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <IonList>
          <IonItem lines="full">
            <IonLabel>{t("dateOfDelivery")}</IonLabel>
            <div slot="end">
              <IonDatetimeButton datetime="datetime"></IonDatetimeButton>
              <IonModal keepContentsMounted={true}>
                <IonDatetime
                  firstDayOfWeek={1}
                  id="datetime"
                  presentation="date"
                  locale={i18n.language}
                  onIonChange={handleChangeDatetime}
                ></IonDatetime>
              </IonModal>
            </div>
          </IonItem>
          {sortedRoute.length > MIN_USERS_FOR_SEARCH ? (
            <IonItem lines="full" color="light">
              <IonSearchbar
                placeholder={t("search")}
                onIonInput={(e) => setSearch(e.detail.value as string)}
                onIonClear={() => setSearch("")}
              />
            </IonItem>
          ) : null}
        </IonList>
        <IonList>
          <IonRadioGroup
            value={selected}
            onIonChange={(e) => setSelected(e.detail.value)}
          >
            {sortedRoute.map(([r, i]) => {
              const user = chainUsers?.find((u) => u.uid === r);
              if (!user) return null;
              let found =
                search !== "" ? RegExp(search, "i").test(user.name) : true;
              if (!found) return null;

              const isSelected = selected === user.uid;
              const isMe = user.uid === authUser?.uid;
              const isPaused = IsPaused(user, chain?.uid);
              return (
                <IonItem
                  disabled={isPaused && !isChainAdmin}
                  lines="full"
                  key={user.uid}
                >
                  <div slot="start" className="tw-flex tw-items-center">
                    {isPaused ? (
                      <IonIcon
                        icon={pauseCircleSharp}
                        className="tw-w-6 tw-h-6"
                      />
                    ) : (
                      <span className="!tw-font-bold">{`#${i + 1}`}</span>
                    )}
                  </div>
                  <IonRadio
                    className={`tw-text-lg ${isMe ? "tw-text-primary" : ""} ${
                      isSelected ? "!tw-font-semibold" : ""
                    }`}
                    value={user.uid}
                  >
                    {user.name}
                  </IonRadio>
                </IonItem>
              );
            })}
          </IonRadioGroup>
        </IonList>
      </IonContent>
    </IonModal>
  );
}
