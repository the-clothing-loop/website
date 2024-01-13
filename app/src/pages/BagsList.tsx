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
  IonPopover,
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
  ellipsisHorizontalCircleOutline,
  flashOutline,
  gridOutline,
  list,
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
import OverlayPaused from "../components/OverlayPaused";
import { Dayjs } from "dayjs";
import OverlayAppDisabled from "../components/OverlayChainAppDisabled";

const MIN_BAG_LIST = 9;
const MIN_USERS_FOR_SEARCH = 15;

export default function BagsList() {
  const { t } = useTranslation();
  const {
    isChainAdmin,
    chain,
    chainUsers,
    bags,
    setChain,
    authUser,
    route,
    bagListView,
    setBagListView,
  } = useContext(StoreContext);
  const modal = useRef<HTMLIonModalElement>(null);
  const sheetModal = useRef<HTMLIonModalElement>(null);
  const [presentAlert] = useIonAlert();

  // -1: nothing is shown
  //  n: that bag id is shown
  const [openCard, setOpenCard] = useState(-1);
  const [updateBag, setUpdateBag] = useState<Bag | null>(null);
  const [sheetModalUserUID, setSheetModalUserUID] = useState("");
  const [sheetModalBagID, setSheetModalBagID] = useState(0);
  const [bagColor, setBagColor] = useState("");

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
    if (bagListView === "card") {
      _bagsCard = bags;
    } else if (bagListView === "list") {
      _bagsList = bags;
    } else {
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
    }
    return [_bagsCard, _bagsList];
  }, [bags, route, bagListView]);

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
      <OverlayPaused />
      <OverlayAppDisabled />
      <IonHeader translucent>
        <IonToolbar>
          <IonButtons>
            <IonButton id="popover-bag-view">
              <IonIcon icon={ellipsisHorizontalCircleOutline} />
            </IonButton>
            <IonPopover trigger="popover-bag-view" dismissOnSelect={true}>
              <IonContent>
                <IonList>
                  <IonItem
                    button={true}
                    detail={false}
                    lines="full"
                    color={bagListView === "dynamic" ? "primary" : undefined}
                    onClick={() => setBagListView("dynamic")}
                  >
                    <IonIcon slot="start" icon={flashOutline}></IonIcon>
                    {t("automatic")}
                  </IonItem>
                  <IonItem
                    button={true}
                    detail={false}
                    lines="full"
                    color={bagListView === "list" ? "primary" : undefined}
                    onClick={() => setBagListView("list")}
                  >
                    <IonIcon slot="start" icon={list}></IonIcon>
                    {t("list")}
                  </IonItem>
                  <IonItem
                    button={true}
                    detail={false}
                    lines="none"
                    color={bagListView === "card" ? "primary" : undefined}
                    onClick={() => setBagListView("card")}
                  >
                    <IonIcon slot="start" icon={gridOutline}></IonIcon>
                    {t("card")}
                  </IonItem>
                </IonList>
              </IonContent>
            </IonPopover>
          </IonButtons>

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
            <IonTitle size="large" className="tw-text-green tw-font-serif">
              {t("whereIsTheBag")}
            </IonTitle>
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
                const { isBagTooOldMe, isBagTooOldHost } = BagTooOld(
                  authUser,
                  bag.user_uid,
                  isChainAdmin,
                  bagUpdatedAt,
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
                      className="ion-no-margin tw-relative tw-overflow-visible tw-rounded-none tw-text-[0px]"
                    >
                      {isChainAdmin ? (
                        <IonButton
                          size="small"
                          color="clear"
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
                          isBagTooOldMe ? "tw-text-danger" : "tw-text-text"
                        }`}
                      >
                        {bagUpdatedAt.toDate().toLocaleDateString()}
                        {isBagTooOldMe || isBagTooOldHost ? (
                          <span className="tw-bg-danger tw-h-2 tw-w-2 tw-rounded-full tw-inline-block tw-ms-[3px] tw-mb-[1px]"></span>
                        ) : null}
                      </div>
                      <div
                        className="tw-p-0 tw-pt-0"
                        onClick={() => handleClickItem(bag.id, bag.user_uid)}
                      >
                        <BagSVG bag={bag} />
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
                const { isBagTooOldMe, isBagTooOldHost } = BagTooOld(
                  authUser,
                  bag.user_uid,
                  isChainAdmin,
                  bagUpdatedAt,
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
                          <BagSVG bag={bag} isList />
                        </div>
                        <div
                          className="ion-text-ellipsis"
                          onClick={() => handleClickItem(bag.id, bag.user_uid)}
                        >
                          <span className="!tw-font-bold">{bag.number}</span>
                          <span
                            className={`tw-block tw-text-base tw-mt-[3px] ${
                              isBagTooOldMe
                                ? "tw-text-danger"
                                : "tw-text-medium"
                            }`}
                          >
                            {bagUpdatedAt.toDate().toLocaleDateString()}
                            {isBagTooOldMe || isBagTooOldHost ? (
                              <span className="tw-bg-danger tw-h-2 tw-w-2 tw-rounded-full tw-inline-block tw-ms-[3px] tw-mb-[1px]"></span>
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
          className="tw-absolute tw-inset-0 tw-bg-[#ffffffa0] dark:tw-bg-[#000000a0] tw-flex tw-flex-col tw-justify-center tw-items-center tw-z-10"
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

function BagSVG({ bag, isList }: { bag: Bag; isList?: boolean }) {
  return (
    <svg
      id="Laag_1"
      xmlns="http://www.w3.org/2000/svg"
      xmlnsXlink="http://www.w3.org/1999/xlink"
      x="0px"
      y="0px"
      viewBox="32.3 21.34 235.2 238.09"
      xmlSpace="preserve"
    >
      <style type="text/css">
        {
          // "\n\t.st0{fill:none;}\n\t.st1{fill:#FFFFFF;}\n\t.st2{fill:{bag.color};}\n\t.st3{font-family:'PlayfairDisplay-Bold';}\n\t.st4{font-size:115.218px;}\n"
        }
      </style>
      <g>
        <g>
          {isList ? null : (
            <rect
              fill={bag.color}
              x="32.3"
              y="21.34"
              width="235.2"
              height="238.09"
            ></rect>
          )}
          <path
            className="st0"
            fill="none"
            d="M200.7,79.9c-9.6-7.1-20.4-11.2-32.2-12.6c11.4,5.2,21.1,12.6,28.7,22.5c6.5,8.4,11,17.8,13.4,28.1h16 C222.6,102.5,214,89.7,200.7,79.9z"
          />
          <path
            className="st0"
            fill="none"
            d="M150.7,67.7c-1.5-0.3-3.2,0.2-4.8,0.5c-13.8,3-25.6,9.5-35.4,19.7c-8.3,8.6-13.9,18.7-16.8,30h111.5 c-3-11.7-8.7-21.9-17.1-30.5C177.7,76.8,165.2,70.2,150.7,67.7z"
          />
          <path
            className="st0"
            fill="none"
            d="M130.8,67.3c-9.8,1.3-18.8,4.4-27.1,9.6C95.3,82,88.4,88.6,83,96.7c-4.4,6.6-7.6,13.6-9.5,21.2h14.8 C94.1,94.6,108.4,77.9,130.8,67.3z"
          />
          <path
            className="st1"
            fill={isList ? bag.color : "#fff"}
            d="M232.2,117.9c-3.2-13.4-9.8-25.1-19.7-35c-8.4-8.4-18.4-14.4-29.8-18.1c-9.4-3-19-4-28.8-3.2 c-1.7,0.1-3.5,0.5-5.1,0.3c-7.1-0.8-14.3-0.8-21.4,0.4c-15.3,2.5-28.4,9.3-39.5,20.1c-10.1,9.9-16.8,21.8-20.1,35.5h-5.5v119.7 h175.2V117.9H232.2z M73.4,117.9c1.9-7.6,5.1-14.6,9.5-21.2c5.5-8.1,12.4-14.7,20.7-19.9c8.3-5.1,17.3-8.3,27.1-9.6 c-22.4,10.6-36.7,27.3-42.6,50.7H73.4z M93.7,117.9c2.9-11.4,8.5-21.4,16.8-30c9.8-10.2,21.6-16.7,35.4-19.7 c1.6-0.3,3.2-0.8,4.8-0.5c14.6,2.5,27,9.1,37.4,19.7c8.4,8.6,14.1,18.8,17.1,30.5H93.7z M210.7,117.9 c-2.4-10.3-6.9-19.6-13.4-28.1c-7.7-9.9-17.3-17.4-28.7-22.5c11.9,1.4,22.6,5.5,32.2,12.6c13.3,9.8,21.9,22.5,25.9,38H210.7z"
          />
        </g>
        {isList ? null : (
          <switch>
            <foreignObject
              width="178"
              height="121"
              x="62"
              y="118"
              requiredFeatures="http://www.w3.org/TR/SVG11/feature#Extensibility"
            >
              <p
                text-anchor="middle"
                style={{
                  color: bag.color,
                  fontFamily: "'PlayfairDisplay-Bold'",
                  fontWeight: "bold",
                  fontSize: bag.number.length * -1.8 + 52 + "px",
                  margin: "0",
                  display: "grid",
                  height: "100%",
                  textAlign: "center",
                  alignItems: "center",
                }}
              >
                {bag.number}
              </p>
            </foreignObject>
            <text
              transform="matrix(0.887 0 0 1 97.4705 180.6156)"
              text-anchor="middle"
              alignmentBaseline="middle"
              x="57.30"
              y="3%"
              fill={bag.color}
              fontFamily="'PlayfairDisplay-Bold'"
              fontWeight="bold"
              fontSize={bag.number.length * -1 + 40 + "px"}
            >
              {bag.number}
            </text>
          </switch>
        )}
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

function BagTooOld(
  authUser: User | null,
  bagUserUID: string,
  isChainAdmin: boolean,
  bagUpdatedAt: Dayjs,
) {
  const isBagTooOld = bagUpdatedAt.isBefore(dayjs().add(-7, "days"));
  const isBagTooOldMe = bagUserUID === authUser?.uid && isBagTooOld;
  const isBagTooOldHost = isChainAdmin && isBagTooOld;

  return { isBagTooOld, isBagTooOldMe, isBagTooOldHost };
}
