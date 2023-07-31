import {
  IonButton,
  IonButtons,
  IonCard,
  IonCol,
  IonContent,
  IonDatetime,
  IonDatetimeButton,
  IonGrid,
  IonHeader,
  IonIcon,
  IonItem,
  IonItemDivider,
  IonLabel,
  IonList,
  IonModal,
  IonPage,
  IonRadio,
  IonRadioGroup,
  IonRefresher,
  IonRefresherContent,
  IonRouterLink,
  IonRow,
  IonSearchbar,
  IonText,
  IonTitle,
  IonToolbar,
  RefresherEventDetail,
  useIonAlert,
} from "@ionic/react";
import {
  chevronForwardOutline,
  closeOutline,
  ellipsisHorizontal,
  pauseCircle,
  personCircleOutline,
} from "ionicons/icons";
import type {
  DatetimeChangeEventDetail,
  IonDatetimeCustomEvent,
  IonModalCustomEvent,
} from "@ionic/core/components";
import {
  useContext,
  useRef,
  useState,
  MouseEvent,
  RefObject,
  useMemo,
  useEffect,
} from "react";
import { useTranslation } from "react-i18next";
import { Bag, bagPut, bagRemove, UID, User } from "../api";
import CreateBag from "../components/CreateUpdateBag";
import { StoreContext } from "../Store";
import dayjs from "../dayjs";
import { Sleep } from "../utils/sleep";
import { useLongPress } from "use-long-press";
import { OverlayEventDetail } from "@ionic/react/dist/types/components/react-component-lib/interfaces";
import IsPrivate from "../utils/is_private";

const MIN_BAG_LIST = 9;
const MIN_USERS_FOR_SEARCH = 15;

export default function BagsList() {
  const { t } = useTranslation();
  const { isChainAdmin, chain, chainUsers, bags, setChain, authUser, route } =
    useContext(StoreContext);
  const modal = useRef<HTMLIonModalElement>(null);
  const sheetModal = useRef<HTMLIonModalElement>(null);
  const [presentAlert] = useIonAlert();

  // -1: nothing is shown
  //  n: that bag id is shown
  const [openCard, setOpenCard] = useState(-1);
  const [updateBag, setUpdateBag] = useState<Bag | null>(null);
  const [sheetModalUserUID, setSheetModalUserUID] = useState("");
  const [sheetModalBagID, setSheetModalBagID] = useState(0);

  const [bagsCard, bagsList] = useMemo(() => {
    if (!authUser) return [[], []];
    let authRouteIndex = authUser ? route.indexOf(authUser.uid) : -1;

    let indexAllowed: number[] = [];
    const routeLength = route.length;
    if (authRouteIndex !== -1) {
      indexAllowed = [
        authRouteIndex - 2,
        authRouteIndex - 1,
        authRouteIndex,
        authRouteIndex + 1,
        authRouteIndex + 2,
      ];

      // ensure that the index overflows to the end or beginning
      indexAllowed.forEach((i, index) => {
        if (index < 0) {
          indexAllowed[i] = (index % routeLength) + routeLength;
        } else if (index >= routeLength) {
          indexAllowed[i] = index % routeLength;
        }
      });
    }

    let _bagsCard: Bag[] = [];
    let _bagsList: Bag[] = [];
    if (bags.length < MIN_BAG_LIST) {
      _bagsCard = bags;
    } else {
      bags.forEach((bag) => {
        if (authUser?.uid === bag.user_uid) {
          _bagsCard.push(bag);
          return;
        }

        let routeIndex = route.indexOf(bag.user_uid);
        if (indexAllowed.indexOf(routeIndex) !== -1) {
          _bagsCard.push(bag);
          return;
        }

        _bagsList.push(bag);
      });
    }
    return [_bagsCard, _bagsList];
  }, [bags, route]);

  function refreshBags() {
    setChain(chain, authUser!.uid);
  }

  function handleClickDelete(bagID: number, bagNo: string) {
    setOpenCard(-1);
    const handler = async () => {
      await bagRemove(chain!.uid, authUser!.uid, bagID);
      await setChain(chain, authUser!.uid);
    };
    presentAlert({
      header: t("deleteBag"),
      message: t("areYouSureYouWantToDeleteBag", { name: bagNo }),
      buttons: [
        {
          text: t("cancel"),
        },
        {
          text: t("delete"),
          role: "destructive",
          handler,
        },
      ],
    });
  }
  function handleClickEdit(bag: Bag) {
    setUpdateBag(bag);
    setOpenCard(-1);
    modal.current?.present();
  }

  function handleRefresh(e: CustomEvent<RefresherEventDetail>) {
    const refreshPromise = setChain(chain, authUser!.uid);
    const sleepPromise = Sleep(500);
    Promise.all([refreshPromise, sleepPromise]).then(() => {
      e.detail.complete();
    });
  }

  function handleClickItem(bagID: number, currentHolder: UID) {
    setSheetModalUserUID(currentHolder);
    setSheetModalBagID(bagID);
    sheetModal.current?.present();
  }
  function handleDidDismissSheetModal(
    e: IonModalCustomEvent<OverlayEventDetail<any>>,
  ) {
    e.detail.data;
  }

  function handleClickCreate() {
    setUpdateBag(null);
    modal.current?.present();
  }
  function handleClickOptions(bagID: number) {
    if (isChainAdmin) setOpenCard(bagID);
  }

  return (
    <IonPage>
      <IonHeader translucent>
        <IonToolbar>
          <IonTitle>{t("whereIsTheBag")}</IonTitle>

          {isChainAdmin ? (
            <IonButtons slot="end">
              <IonButton onClick={handleClickCreate}>{t("create")}</IonButton>
            </IonButtons>
          ) : null}
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <IonHeader collapse="condense">
          <IonToolbar>
            <IonTitle size="large">{t("whereIsTheBag")}</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonText color="medium" className="ion-margin">
          {t("clickOnBagToChangeHolder")}
        </IonText>
        <div>
          <IonRefresher
            slot="fixed"
            onIonRefresh={handleRefresh}
            style={{ zIndex: 0 }}
          >
            <IonRefresherContent />
          </IonRefresher>
          <IonGrid>
            <IonRow>
              {bagsCard.map((bag) => {
                const user = chainUsers.find((u) => u.uid === bag.user_uid);
                if (!user) return null;
                let routeIndex = route.indexOf(user.uid);
                if (routeIndex === -1) return null;
                const bagUpdatedAt = dayjs(bag.updated_at);
                const isBagTooOld = bagUpdatedAt.isBefore(
                  dayjs().add(-7, "days"),
                );
                const isBagNameNumeric = Number.isSafeInteger(
                  Number.parseInt(bag.number),
                );

                return (
                  <IonCol size="6" key={"inRoute" + bag.id}>
                    <Card
                      open={openCard === bag.id}
                      setOpen={(v) => {
                        if (isChainAdmin) setOpenCard(v ? bag.id : -1);
                      }}
                      onClickDelete={() =>
                        handleClickDelete(bag.id, bag.number)
                      }
                      onClickEdit={() => handleClickEdit(bag)}
                      className="ion-no-margin"
                      style={{ position: "relative", overflow: "visible" }}
                    >
                      {isChainAdmin ? (
                        <IonButton
                          size="small"
                          color="light"
                          style={{
                            "--padding-start": "5px",
                            "--padding-end": "5px",
                            position: "absolute",
                            top: 0,
                            right: 3,
                            zIndex: 2,
                          }}
                          onClick={() => handleClickOptions(bag.id)}
                        >
                          <IonIcon icon={ellipsisHorizontal} />
                        </IonButton>
                      ) : null}
                      <div
                        key="old"
                        style={{
                          fontSize: 14,
                          display: "block",
                          position: "absolute",
                          top: "5px",
                          left: "10px",
                          ...(isBagTooOld
                            ? {
                                color: "var(--ion-color-danger)",
                              }
                            : {}),
                        }}
                      >
                        {bagUpdatedAt.toDate().toLocaleDateString()}
                        {isBagTooOld ? (
                          <span
                            style={{
                              backgroundColor: "var(--ion-color-danger)",
                              height: 6,
                              width: 6,
                              borderRadius: "100%",
                              display: "inline-block",
                              marginInlineStart: 3,
                              marginBottom: 1,
                            }}
                          ></span>
                        ) : null}
                      </div>
                      <div
                        style={{
                          padding: "20px 10px 10px",
                        }}
                        onClick={() => handleClickItem(bag.id, bag.user_uid)}
                      >
                        <div
                          className="bagslist-bag-icon"
                          style={{
                            padding: "10px 20px 2px",
                          }}
                        >
                          <BagSVG color={bag.color} />
                        </div>
                        <div
                          style={{
                            textAlign: "center",
                            fontWeight: "bold",
                            fontSize: 16,
                            lineHeight: "22px",
                            color: "var(--ion-color-dark)",
                          }}
                          className="ion-text-ellipsis"
                        >
                          {(bag.number.length > 7 ? "" : t("bag") + " ") +
                            bag.number}
                        </div>
                      </div>

                      <IonRouterLink
                        routerLink={"/address/" + user.uid}
                        style={{
                          padding: "12px 8px",
                          display: "block",
                          backgroundColor: "var(--ion-color-light)",
                        }}
                      >
                        <UserLink user={user} routeIndex={routeIndex} />
                      </IonRouterLink>
                    </Card>
                  </IonCol>
                );
              })}
              {bagsList.map((bag) => {
                const user = chainUsers.find((u) => u.uid === bag.user_uid);
                if (!user) return null;
                let routeIndex = route.indexOf(user.uid);
                if (routeIndex === -1) return null;
                const bagUpdatedAt = dayjs(bag.updated_at);
                const isBagTooOld = bagUpdatedAt.isBefore(
                  dayjs().add(-7, "days"),
                );
                let isOpen = openCard == bag.id;
                return (
                  <IonCol
                    size="12"
                    key={bag.id}
                    style={{
                      padding: "2px 5px",
                    }}
                  >
                    <IonCard className="ion-no-margin">
                      <IonItem
                        lines="none"
                        style={{
                          padding: "3px 0",
                        }}
                      >
                        <div
                          slot="start"
                          style={{ width: 24, height: 24 }}
                          className="bagslist-bag-icon"
                          onClick={() => handleClickItem(bag.id, bag.user_uid)}
                        >
                          <BagSVG color={bag.color} />
                        </div>
                        <div
                          className="ion-text-ellipsis"
                          onClick={() => handleClickItem(bag.id, bag.user_uid)}
                        >
                          <span className="ion-text-bold">
                            {(bag.number.length > 7 ? "" : t("bag") + " ") +
                              bag.number}
                          </span>
                          <span
                            style={{
                              display: "block",
                              fontSize: 14,
                              marginTop: 3,
                              ...(isBagTooOld
                                ? {
                                    color: "var(--ion-color-danger)",
                                  }
                                : {
                                    color: "var(--ion-color-medium)",
                                  }),
                            }}
                          >
                            {bagUpdatedAt.toDate().toLocaleDateString()}
                            {isBagTooOld ? (
                              <span
                                style={{
                                  backgroundColor: "var(--ion-color-danger)",
                                  height: 6,
                                  width: 6,
                                  borderRadius: "100%",
                                  display: "inline-block",
                                  marginInlineStart: 3,
                                  marginBottom: 1,
                                }}
                              ></span>
                            ) : null}
                          </span>
                        </div>

                        {isOpen ? (
                          <>
                            <IonButton
                              slot="end"
                              color="primary"
                              onClick={() => handleClickEdit(bag)}
                            >
                              {t("edit")}
                            </IonButton>
                            <IonButton
                              slot="end"
                              color="danger"
                              onClick={() =>
                                handleClickDelete(bag.id, bag.number)
                              }
                            >
                              {t("delete")}
                            </IonButton>
                          </>
                        ) : (
                          <IonButton
                            color="light"
                            slot="end"
                            routerLink={"/address/" + user.uid}
                            style={{ width: 115, height: 35 }}
                          >
                            <UserLink user={user} routeIndex={routeIndex} />
                          </IonButton>
                        )}
                        {isChainAdmin ? (
                          <IonButton
                            slot="end"
                            fill="clear"
                            color="dark"
                            onClick={() =>
                              setOpenCard((s) => (s == bag.id ? -1 : bag.id))
                            }
                          >
                            {isOpen ? (
                              <IonIcon icon={closeOutline} />
                            ) : (
                              <IonIcon icon={ellipsisHorizontal} />
                            )}
                          </IonButton>
                        ) : null}
                      </IonItem>
                    </IonCard>
                  </IonCol>
                );
              })}
            </IonRow>
          </IonGrid>
        </div>
        <CreateBag bag={updateBag} modal={modal} didDismiss={refreshBags} />
        <SelectUserModal
          modal={sheetModal}
          selectedUserUID={sheetModalUserUID}
          bagID={sheetModalBagID}
          didDismiss={handleDidDismissSheetModal}
        />
      </IonContent>
    </IonPage>
  );
}

function Card({
  open,
  setOpen,
  onClickEdit,
  onClickDelete,
  children,
  ...props
}: React.ComponentProps<typeof IonCard> & {
  open: boolean;
  setOpen: (v: boolean) => void;
  onClickEdit: () => void;
  onClickDelete: () => void;
}) {
  const { t } = useTranslation();
  const bind = useLongPress(
    () => {
      if (!open) {
        setOpen(true);
      }
    },
    {
      onCancel: () => {
        if (open) {
          setOpen(false);
        }
      },
    },
  );

  function handleEdit<E>(e: MouseEvent<E>) {
    onClickEdit();
  }

  function handleDelete<E>(e: MouseEvent<E>) {
    onClickDelete();
  }

  function handleClose<E>(e: MouseEvent<E>) {
    setOpen(false);
  }

  return (
    <IonCard {...props}>
      <div {...bind()} tabIndex={0}>
        {children}
      </div>
      {open ? (
        <div
          key="options"
          style={{
            position: "absolute",
            top: 0,
            bottom: 0,
            left: 0,
            right: 0,
            backgroundColor: "#ffffffa0",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 2,
          }}
        >
          <IonButton
            size="small"
            color="light"
            style={{
              "--padding-start": "5px",
              "--padding-end": "5px",
              position: "absolute",
              top: 0,
              right: 3,
            }}
            onClick={handleClose}
          >
            <IonIcon icon={closeOutline} />
          </IonButton>
          <IonButton size="small" onClick={handleEdit}>
            {t("edit")}
          </IonButton>
          <IonButton size="small" color="danger" onClick={handleDelete}>
            {t("delete")}
          </IonButton>
        </div>
      ) : null}
    </IonCard>
  );
}

function SelectUserModal({
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
  const { chain, chainUsers, route, authUser, setChain } =
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
    console.log("user:", userUID, " bag:", bagID);

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
    await setChain(chain, authUser!.uid);
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
              // search
              let found =
                search !== "" ? RegExp(search, "i").test(user.name) : true;
              if (!found) return null;

              const isAddressPrivate = IsPrivate(user.address);
              const isSelected = selected === user.uid;
              //   let uc = user.chains.find((u) => u.chain_uid === chain.uid);
              return (
                <IonItem lines="full" key={user.uid}>
                  <span slot="start" className="ion-text-bold">{`#${
                    i + 1
                  }`}</span>
                  <IonLabel>
                    <h2
                      style={{
                        fontSize: 18,
                        ...(isSelected
                          ? {
                              fontWeight: 500,
                            }
                          : {}),
                      }}
                    >
                      {user.name}
                      {user.uid === authUser?.uid ? (
                        <IonIcon
                          icon={personCircleOutline}
                          className="ion-icon-text"
                        />
                      ) : null}
                    </h2>
                    {isAddressPrivate ? null : (
                      <IonText color={isSelected ? undefined : "medium"}>
                        <p style={{ fontSize: 14 }}>{user.address}</p>
                      </IonText>
                    )}
                  </IonLabel>
                  <IonRadio slot="end" value={user.uid} />
                </IonItem>
              );
            })}
          </IonRadioGroup>
        </IonList>
      </IonContent>
    </IonModal>
  );
}

function BagSVG({ color }: { color: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 47.5 47.5" id="bag">
      <defs>
        <clipPath id="a">
          <path d="M0 38h38V0H0v38Z"></path>
        </clipPath>
      </defs>
      <g clipPath="url(#a)" transform="matrix(1.25 0 0 -1.25 0 47.5)">
        <path
          fill="#ffac33"
          d="M29 15a1 1 0 0 0-1 1v6c0 6.065-4.037 11-9 11-4.962 0-9-4.935-9-11v-6a1 1 0 1 0-2 0v6c0 7.168 4.935 13 11 13s11-5.832 11-13v-6a1 1 0 0 0-1-1"
        ></path>
        <path
          fill={color || "#9266cc"}
          d="M34.386 24.028C34.126 26.213 32.115 28 29.914 28H8.086c-2.2 0-4.212-1.787-4.471-3.972L1.472 5.972C1.212 3.787 2.8 2 5 2h28c2.2 0 3.788 1.787 3.529 3.972l-2.143 18.056Z"
        ></path>
        <path
          fill="#ffd983"
          d="M29 17a1 1 0 0 0-1 1v6c0 6.065-4.037 11-9 11-4.962 0-9-4.935-9-11v-6a1 1 0 1 0-2 0v6c0 7.168 4.935 13 11 13s11-5.832 11-13v-6a1 1 0 0 0-1-1"
        ></path>
      </g>
    </svg>
  );
}

function UserLink({ user, routeIndex }: { user: User; routeIndex: number }) {
  const { t } = useTranslation();
  return (
    <div
      className="ion-text-bold"
      style={{
        color: "var(--ion-color-medium)",
        display: "flex",
        flexDirection: "row",
        alignItems: "baseline",
        fontSize: 12,
        width: "100%",
      }}
    >
      {user.paused_until ? (
        <IonIcon
          style={{
            transform: "translateY(1px)",
            width: 16,
            height: 16,
            minWidth: 16,
            marginInlineEnd: 3,
          }}
          icon={pauseCircle}
        />
      ) : (
        <span style={{ marginInlineEnd: 3 }}>{"#" + (routeIndex + 1)}</span>
      )}
      <span
        className="ion-text-ellipsis"
        style={{
          fontSize: 14,
          flexGrow: 1,
          display: "block",
          color: user.paused_until
            ? "var(--ion-color-medium)"
            : "var(--ion-color-dark)",
        }}
      >
        {user.name}
      </span>
      <IonIcon
        icon={chevronForwardOutline}
        className="ion-icon-text"
        style={{ minWidth: 12, width: 12 }}
      ></IonIcon>
    </div>
  );
}
