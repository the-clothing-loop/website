import {
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonModal,
  IonPage,
  IonRadio,
  IonRadioGroup,
  IonSearchbar,
  IonTitle,
  IonToolbar,
} from "@ionic/react";
import { useContext, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { StoreContext } from "../stores/Store";
import { ellipsisHorizontalCircleOutline, openOutline } from "ionicons/icons";
import IsPrivate from "../utils/is_private";
import OverlayPaused from "../components/OverlayPaused";
import OverlayAppDisabled from "../components/OverlayChainAppDisabled";
import EditHeaders from "../components/EditHeaders";
import HeaderTitle from "../components/HeaderTitle";
import AddressListItem, {
  AddressListItemProps,
} from "../components/AddressList/AddressListItem";
import wrapIndex from "../utils/wrap_index";
import { useDebounce } from "@uidotdev/usehooks";
import isPaused from "../utils/is_paused";

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
    routeListView,
    setRouteListView,
  } = useContext(StoreContext);
  const { t } = useTranslation();
  const headerSheetModal = useRef<HTMLIonModalElement>(null);

  const headerKey = "addressList";

  const headerText = getChainHeader("addressList", t("addresses"));

  function updateChain() {
    setChain(chain?.uid, authUser);
  }

  const [search, setSearch] = useState("");
  const slowSearch = useDebounce(search, 500);
  const routeListItems = useMemo(() => {
    const routeLength = route.length;
    if (!chain || routeLength === 0) return [];
    let meRouteIndex = -1;
    if (authUser) {
      meRouteIndex = route.findIndex((uid) => uid === authUser.uid);
    }
    let topRouteIndex = 0;
    if (routeListView === "dynamic") {
      const routePrivacy = chain.route_privacy || 2;
      if (routePrivacy * 2 < routeLength) {
        topRouteIndex = wrapIndex(
          meRouteIndex - (routePrivacy <= 3 ? routePrivacy : 3),
          routeLength,
        );
      }
      console.log("topRouteIndex", topRouteIndex);
    }

    let arr = [] as AddressListItemProps[];
    let i = topRouteIndex;
    do {
      const userUID = route[i];
      const user = chainUsers.find((u) => u.uid === userUID);
      if (!user) {
        console.error("User not found in chainUsers", userUID);
        i = wrapIndex(i + 1, routeLength);
        continue;
      }

      if (
        slowSearch
          ? user.name.toLowerCase().includes(slowSearch.toLowerCase())
          : true
      ) {
        const isMe = user.uid === authUser?.uid;
        const userBags = bags.filter((b) => b.user_uid === user.uid);
        const isHost =
          user.chains.find((uc) => uc.chain_uid === chain?.uid)
            ?.is_chain_admin || false;

        const isPrivate = IsPrivate(user.email);
        const isAddressPrivate = IsPrivate(user.address);
        const isUserPaused = isPaused(user, chain.uid);

        arr.push({
          user,
          bags: userBags,
          isMe,
          isHost,
          isAddressPrivate,
          number: i + 1,
          isUserPaused,
          routerLink: isPrivate ? undefined : "/address/" + user.uid,
        });
      }

      i = wrapIndex(i + 1, routeLength);
    } while (i !== topRouteIndex);
    return arr;
  }, [route, chainUsers, routeListView, slowSearch]);

  return (
    <IonPage>
      <OverlayPaused />
      <OverlayAppDisabled />
      <IonHeader translucent>
        <IonToolbar>
          <IonButtons>
            {isChainAdmin ? (
              <IonButton id="sheet-address-options">
                <IonIcon icon={ellipsisHorizontalCircleOutline} />
                {slowSearch ? (
                  <div className="tw-rounded-full tw-w-2 tw-h-2 tw-absolute tw-bottom-1 tw-right-0 tw-bg-danger"></div>
                ) : null}
              </IonButton>
            ) : null}
            <IonModal
              trigger="sheet-address-options"
              initialBreakpoint={0.4}
              breakpoints={[0, 0.4, 0.8]}
            >
              <IonContent color="light">
                <IonList>
                  <IonItem lines="full">
                    <IonSearchbar
                      onIonInput={(e) => setSearch(e.detail.value as string)}
                      onIonClear={() => setSearch("")}
                      value={search}
                      placeholder="Search"
                    ></IonSearchbar>
                  </IonItem>
                  <IonItem lines="full" color="light">
                    <p className="tw-font-bold">Sort</p>
                  </IonItem>
                  <IonRadioGroup
                    value={routeListView}
                    onIonChange={(e: any) => setRouteListView(e.detail.value)}
                  >
                    <IonItem lines="full">
                      <IonLabel>
                        <h2
                          className={`tw-text-lg ${
                            routeListView === "dynamic"
                              ? "!tw-font-semibold"
                              : ""
                          }`}
                        >
                          {t("automatic")}
                        </h2>
                      </IonLabel>
                      <IonRadio slot="end" value="dynamic" />
                    </IonItem>
                    <IonItem lines="full">
                      <IonLabel>
                        <h2
                          className={`tw-text-lg ${
                            routeListView === "list" ? "!tw-font-semibold" : ""
                          }`}
                        >
                          {t("list")}
                        </h2>
                      </IonLabel>
                      <IonRadio slot="end" value="list" />
                    </IonItem>
                  </IonRadioGroup>
                </IonList>
              </IonContent>
            </IonModal>
          </IonButtons>
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
            {routeListItems.map((props) => {
              return <AddressListItem {...props} key={props.number} />;
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
