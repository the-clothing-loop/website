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
            className="tw-z-0"
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
                      className="ion-no-margin tw-relative tw-overflow-visible"
                    >
                      {isChainAdmin ? (
                        <IonButton
                          size="small"
                          color="light"
                          style={{
                            "--padding-start": "5px",
                            "--padding-end": "5px",
                          }}
                          className="tw-absolute tw-top-0 tw-right-[3px] tw-z-10"
                          onClick={() => handleClickOptions(bag.id)}
                        >
                          <IonIcon icon={ellipsisHorizontal} />
                        </IonButton>
                      ) : null}
                      <div
                        key="old"
                        className={`tw-text-sm tw-block tw-absolute tw-top-[5px] tw-left-[10px] ${
                          isBagTooOld ? "tw-text-danger" : ""
                        }`}
                      >
                        {bagUpdatedAt.toDate().toLocaleDateString()}
                        {isBagTooOld ? (
                          <span className="tw-bg-danger tw-h-1.5 tw-w-1.5 tw-rounded-full tw-inline-block tw-ms-[3px] tw-mb-[1px]"></span>
                        ) : null}
                      </div>
                      <div
                        className="tw-p-2.5 tw-pt-5"
                        onClick={() => handleClickItem(bag.id, bag.user_uid)}
                      >
                        <div className="bagslist-bag-icon tw-pt-2.5 tw-px-5 tw-pb-0.5">
                          <BagSVG color={bag.color} />
                        </div>
                        <div className="ion-text-ellipsis tw-text-center tw-font-bold tw-text-base tw-text-dark ">
                          // See: server/docs/bag_name.md
                          {(bag.number.length > 7 ? "" : t("bag") + " ") +
                            bag.number}
                        </div>
                      </div>

                      <IonRouterLink
                        routerLink={"/address/" + user.uid}
                        className="tw-py-3 tw-px-2 tw-block tw-bg-light"
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
                    className="tw-py-0.5 tw-px-[5px]"
                  >
                    <IonCard className="ion-no-margin">
                      <IonItem lines="none" className="tw-py-[3px] tw-px-0">
                        <div
                          slot="start"
                          className="bagslist-bag-icon tw-w-6 tw-h-6"
                          onClick={() => handleClickItem(bag.id, bag.user_uid)}
                        >
                          <BagSVG color={bag.color} />
                        </div>
                        <div
                          className="ion-text-ellipsis"
                          onClick={() => handleClickItem(bag.id, bag.user_uid)}
                        >
                          <span className="!tw-font-bold">
                            {(bag.number.length > 7 ? "" : t("bag") + " ") +
                              bag.number}
                          </span>
                          <span
                            className={`tw-block tw-text-base tw-mt-[3px] ${
                              isBagTooOld ? "tw-text-danger" : "tw-text-medium"
                            }`}
                          >
                            {bagUpdatedAt.toDate().toLocaleDateString()}
                            {isBagTooOld ? (
                              <span className="tw-bg-danger tw-h-1.5 tw-w-1.5 tw-rounded-full tw-inline-block tw-ms-[3px] tw-mb-[1px]"></span>
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
                            className="tw-w-[115px] tw-h-[35px]"
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
          className="tw-absolute tw-inset-0 tw-bg-[#ffffffa0] tw-flex tw-flex-col tw-justify-center tw-items-center tw-z-10"
        >
          <IonButton
            size="small"
            color="light"
            style={{
              "--padding-start": "5px",
              "--padding-end": "5px",
            }}
            className="tw-absolute tw-top-0 tw-right-[3px]"
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
              const isMe = user.uid === authUser?.uid;
              //   let uc = user.chains.find((u) => u.chain_uid === chain.uid);
              return (
                <IonItem lines="full" key={user.uid}>
                  <span slot="start" className="!tw-font-bold">{`#${
                    i + 1
                  }`}</span>
                  <IonLabel>
                    <h2
                      className={`tw-text-lg ${isMe ? "tw-text-primary" : ""} ${
                        isSelected ? "!tw-font-semibold" : ""
                      }`}
                    >
                      {user.name}
                    </h2>
                    {isAddressPrivate ? null : (
                      <IonText color={isSelected ? undefined : "medium"}>
                        <p className="tw-text-sm">{user.address}</p>
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
    <div className="!tw-font-bold tw-text-medium tw-flex tw-flex-row tw-items-baseline tw-text-xs tw-w-full">
      {user.paused_until ? (
        <IonIcon
          className="tw-translate-y-px tw-w-4 tw-h-4 tw-min-w-[16px] tw-me-[3px]"
          icon={pauseCircle}
        />
      ) : (
        <span className="tw-me-[3px]">{"#" + (routeIndex + 1)}</span>
      )}
      <span
        className={`ion-text-ellipsis tw-text-sm tw-flex-grow tw-block ${
          user.paused_until ? "tw-text-medium" : "tw-text-dark"
        }`}
      >
        {user.name}
      </span>
      <IonIcon
        icon={chevronForwardOutline}
        className="tw-translate-y-0.5 tw-px-0.5 tw-min-w-[12px] tw-w-3"
      ></IonIcon>
    </div>
  );
}
