import {
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonIcon,
  IonList,
  IonPage,
  IonTitle,
  IonToolbar,
} from "@ionic/react";
import { useContext, useRef } from "react";
import { useTranslation } from "react-i18next";
import { StoreContext } from "../stores/Store";
import { openOutline } from "ionicons/icons";
import IsPrivate from "../utils/is_private";
import OverlayPaused from "../components/OverlayPaused";
import OverlayAppDisabled from "../components/OverlayChainAppDisabled";
import EditHeaders from "../components/EditHeaders";
import HeaderTitle from "../components/HeaderTitle";
import AddressListItem from "../components/AddressList/AddressListItem";

export default function AddressList() {
  const {
    chain,
    setChain,
    getChainHeader,
    chainUsers,
    route,
    authUser,
    bags,
    isChainAdmin,
    isThemeDefault,
    shouldBlur,
  } = useContext(StoreContext);
  const { t } = useTranslation();

  const headerSheetModal = useRef<HTMLIonModalElement>(null);

  const headerKey = "addressList";

  const headerText = getChainHeader("addressList", t("addresses"));

  function updateChain() {
    setChain(chain?.uid, authUser);
  }

  return (
    <IonPage>
      <OverlayPaused />
      <OverlayAppDisabled />
      <IonHeader translucent>
        <IonToolbar>
          <IonTitle>{headerText}</IonTitle>
          {isChainAdmin ? (
            <IonButtons
              slot="end"
              className={`${
                isThemeDefault
                  ? "tw-text-red dark:tw-text-red-contrast"
                  : "primary"
              }`}
            >
              <IonButton
                target="_blank"
                href={`https://www.clothingloop.org/loops/${chain?.uid}/members`}
                color={
                  isThemeDefault
                    ? "tw-text-red dark:tw-text-red-contrast"
                    : "primary"
                }
              >
                {t("routeOrder")}
                <IonIcon icon={openOutline} className="tw-text-sm tw-ml-1" />
              </IonButton>
            </IonButtons>
          ) : null}
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <div className="tw-relative tw-min-h-full tw-flex tw-flex-col">
          <IonHeader collapse="condense">
            <IonToolbar>
              <HeaderTitle
                headerText={headerText}
                onEdit={() => headerSheetModal.current?.present()}
                isChainAdmin={isChainAdmin}
                className={"tw-font-serif".concat(
                  isThemeDefault
                    ? " tw-text-red dark:tw-text-red-contrast"
                    : "",
                )}
              />
            </IonToolbar>
          </IonHeader>
          <IonList
            className={"tw-flex-grow".concat(shouldBlur ? " tw-blur" : "")}
          >
            {route.map((userUID, i) => {
              const user = chainUsers.find((u) => u.uid === userUID);
              if (!user) return null;
              const isMe = user.uid === authUser?.uid;
              const userBags = bags.filter((b) => b.user_uid === user.uid);
              const isUserHost =
                user.chains.find((uc) => uc.chain_uid === chain?.uid)
                  ?.is_chain_admin || false;

              const isPrivate = IsPrivate(user.email);
              const isAddressPrivate = IsPrivate(user.address);
              return (
                <AddressListItem
                  user={user}
                  isMe={isMe}
                  bags={userBags}
                  isHost={isUserHost}
                  isAddressPrivate={isAddressPrivate}
                  number={i + 1}
                  key={user.uid}
                  routerLink={isPrivate ? undefined : "/address/" + user.uid}
                />
              );
            })}
          </IonList>
          {isChainAdmin ? (
            <EditHeaders
              modal={headerSheetModal}
              didDismiss={updateChain}
              headerKey={headerKey}
              initialHeader={headerText}
            />
          ) : null}
          <IonIcon
            aria-hidden="true"
            icon="/the_clothing_loop_logo_cropped.svg"
            style={{ fontSize: 150 }}
            className="tw-w-full -tw-mb-2 tw-invert-[60%] tw-overflow-hidden tw-stroke-text dark:tw-stroke-light-tint"
          />
        </div>
      </IonContent>
    </IonPage>
  );
}
