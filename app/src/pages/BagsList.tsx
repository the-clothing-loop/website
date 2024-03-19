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
  construct,
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
  useEffect,
} from "react";
import { useTranslation } from "react-i18next";
import { Bag, UID, User } from "../api/types";
import { bagPut, bagRemove } from "../api/bag";
import CreateBag from "../components/CreateUpdateBag";
import EditHeaders from "../components/EditHeaders";
import { StoreContext } from "../stores/Store";
import { Sleep } from "../utils/sleep";
import { useLongPress } from "use-long-press";
import { OverlayEventDetail } from "@ionic/react/dist/types/components/react-component-lib/interfaces";
import OverlayPaused from "../components/OverlayPaused";
import HeaderTitle from "../components/HeaderTitle";
import OverlayAppDisabled from "../components/OverlayChainAppDisabled";
import BagSVG from "../components/Bags/Svg";
import { useBagTooOld } from "../components/Bags/bag.hook";
import { useLocation } from "react-router";
import BagCardDate from "../components/Bags/BagCardDate";

type State = { bag_id?: number } | undefined;

const MIN_BAG_LIST = 9;
const MIN_USERS_FOR_SEARCH = 15;

export default function BagsList() {
  const { state } = useLocation<State>();
  const { t } = useTranslation();
  const {
    isChainAdmin,
    chain,
    chainUsers,
    bags,
    setChain,
    getChainHeader,
    authUser,
    route,
    bagListView,
    setBagListView,
    isThemeDefault,
    shouldBlur,
  } = useContext(StoreContext);
  const modal = useRef<HTMLIonModalElement>(null);
  const sheetModal = useRef<HTMLIonModalElement>(null);
  const headerSheetModal = useRef<HTMLIonModalElement>(null);
  const subHeaderSheetModal = useRef<HTMLIonModalElement>(null);

  const [presentAlert] = useIonAlert();

  // -1: nothing is shown
  //  n: that bag id is shown
  const [openCard, setOpenCard] = useState(-1);
  const [updateBag, setUpdateBag] = useState<Bag | null>(null);
  const [sheetModalUserUID, setSheetModalUserUID] = useState("");
  const [sheetModalBagID, setSheetModalBagID] = useState(0);

  const longPressSubHeader = useLongPress(() => {
    subHeaderSheetModal.current?.present();
  });

  const headerKey = "bagsList";
  const subHeaderKey = "bagsListSub";

  const headerText = getChainHeader(headerKey, t("whereIsTheBag"));
  const subHeaderText = getChainHeader(
    subHeaderKey,
    t("clickOnBagToChangeHolder"),
  );

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
          let isMe = authUser?.uid === bag.user_uid;
          let routeIndex = route.indexOf(bag.user_uid);
          let isClosest = indexAllowed.indexOf(routeIndex) !== -1;

          if (isMe || isClosest) {
            _bagsCard.push(bag);
          }
        });

        _bagsList = bags;
      }
    }
    return [_bagsCard, _bagsList];
  }, [bags, route, bagListView]);

  useEffect(() => {
    let bagID = state?.bag_id;
    if (!bagID) return;

    let idPrefix = "bag-list-";
    if (bagListView === "card") {
      idPrefix = "bag-card-";
    }
    const el =
      document.getElementById("bag-card-" + state?.bag_id) ||
      document.getElementById("bag-list-" + state?.bag_id);
    el?.scrollIntoView({
      behavior: "instant",
      block: "center",
      inline: "center",
    });
    setTimeout(() => el?.focus(), 0);
  }, [state]);

  function refreshBags() {
    setChain(chain?.uid, authUser);
  }

  function handleClickDelete(bagID: number, bagNo: string) {
    setOpenCard(-1);
    const handler = async () => {
      await bagRemove(chain!.uid, authUser!.uid, bagID);
      await setChain(chain?.uid, authUser);
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
    const refreshPromise = setChain(chain?.uid, authUser);
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

          <IonTitle>{headerText}</IonTitle>

          {isChainAdmin ? (
            <IonButtons slot="end">
              <IonButton onClick={handleClickCreate}>{t("create")}</IonButton>
            </IonButtons>
          ) : null}
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <IonHeader collapse="condense">
          <IonToolbar className="tw-bg-transparent">
            <HeaderTitle
              headerText={headerText}
              onEdit={() => headerSheetModal.current?.present()}
              isChainAdmin={isChainAdmin}
              className={"tw-font-serif".concat(
                isThemeDefault ? " tw-text-green" : "",
              )}
            />
          </IonToolbar>
        </IonHeader>

        {isChainAdmin ? (
          <IonText
            color="medium"
            className="ion-margin"
            {...longPressSubHeader()}
          >
            {subHeaderText}
            <IonIcon
              icon={construct}
              className="tw-text-sm tw-ml-1.5 !tw-text-blue tw-cursor-pointer"
              onClick={() => subHeaderSheetModal.current?.present()}
            />
          </IonText>
        ) : (
          <IonText color="medium" className="ion-margin">
            {subHeaderText}
          </IonText>
        )}

        <div>
          <IonRefresher
            slot="fixed"
            onIonRefresh={handleRefresh}
            className="tw-z-0"
          >
            <IonRefresherContent />
          </IonRefresher>
          <IonGrid>
            <IonRow className={shouldBlur ? "tw-blur" : ""}>
              {bagsCard.map((bag) => {
                const user = chainUsers.find((u) => u.uid === bag.user_uid);
                if (!user) return null;
                let routeIndex = route.indexOf(user.uid);
                if (routeIndex === -1) return null;
                const { bagUpdatedAt, isBagTooOldMe, isBagTooOldHost } =
                  useBagTooOld(authUser, isChainAdmin, bag);
                return (
                  <IonCol size="6" key={"inRoute" + bag.id}>
                    <Card
                      id={"bag-card-" + bag.id}
                      open={openCard === bag.id}
                      setOpen={(v) => {
                        if (isChainAdmin) setOpenCard(v ? bag.id : -1);
                      }}
                      onClickDelete={() =>
                        handleClickDelete(bag.id, bag.number)
                      }
                      onClickEdit={() => handleClickEdit(bag)}
                      tabIndex={-1}
                      className="ion-no-margin tw-relative tw-overflow-visible tw-rounded-none tw-text-[0px] tw-outline tw-outline-0 focus:tw-outline-1 tw-outline-primary tw-transition-colors"
                    >
                      {isChainAdmin ? (
                        <IonButton
                          size="small"
                          color="clear"
                          style={{
                            "--padding-start": "5px",
                            "--padding-end": "5px",
                          }}
                          className="tw-absolute tw-z-10 tw-top-0 tw-right-[3px]"
                          onClick={() => handleClickOptions(bag.id)}
                        >
                          <IonIcon icon={ellipsisHorizontal} />
                        </IonButton>
                      ) : null}
                      <BagCardDate
                        bagUpdatedAt={bagUpdatedAt}
                        isBagTooOldMe={isBagTooOldMe}
                        isBagTooOldHost={isBagTooOldHost}
                      />
                      <div
                        className="tw-relative tw-p-0 tw-pt-0 tw-overflow-hidden"
                        onClick={() => handleClickItem(bag.id, bag.user_uid)}
                      >
                        <div className="tw-scale-100 tw-transition-transform hover:tw-scale-105 tw-cursor-pointer">
                          <BagSVG bag={bag} />
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
                const { bagUpdatedAt, isBagTooOldMe, isBagTooOldHost } =
                  useBagTooOld(authUser, isChainAdmin, bag);
                let isOpen = openCard == bag.id;
                return (
                  <IonCol
                    size="12"
                    key={bag.id}
                    className="tw-py-0.5 tw-px-[5px]"
                  >
                    <IonCard
                      className="ion-no-margin tw-rounded-none tw-outline tw-outline-0 focus:tw-outline-1 tw-outline-primary tw-transition-colors"
                      id={"bag-list-" + bag.id}
                      tabIndex={-1}
                    >
                      <IonItem lines="none" className="tw-py-[3px] tw-px-0">
                        <div className="tw-group tw-flex flex-row tw-items-center">
                          <div
                            slot="start"
                            className="tw-w-6 tw-h-6 tw-mr-4 tw-scale-100 tw-transition-transform group-hover:tw-scale-125"
                            onClick={() =>
                              handleClickItem(bag.id, bag.user_uid)
                            }
                          >
                            <BagSVG bag={bag} isList />
                          </div>
                          <div
                            className="ion-text-ellipsis"
                            onClick={() =>
                              handleClickItem(bag.id, bag.user_uid)
                            }
                          >
                            <span className="!tw-font-bold">{bag.number}</span>
                            <BagCardDate
                              bagUpdatedAt={bagUpdatedAt}
                              isBagTooOldMe={isBagTooOldMe}
                              isBagTooOldHost={isBagTooOldHost}
                              classNameOverride="tw-block tw-text-base tw-mt-[3px] tw-text-medium"
                            />
                          </div>
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
        {isChainAdmin ? (
          <div>
            <EditHeaders
              modal={headerSheetModal}
              didDismiss={refreshBags}
              headerKey={headerKey}
              initialHeader={headerText}
            />
            <EditHeaders
              modal={subHeaderSheetModal}
              didDismiss={refreshBags}
              headerKey={subHeaderKey}
              initialHeader={subHeaderText}
            />
          </div>
        ) : null}
        <div className="relative">
          {/* Background SVG */}
          <IonIcon
            aria-hidden="true"
            icon="/v2_o.svg"
            style={{ fontSize: 400 }}
            color={isThemeDefault ? "" : "light"}
            className="tw-absolute tw-right-[170px] -tw-top-[180px] -tw-z-10 tw-text-green tw-opacity-30"
          />
        </div>
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
