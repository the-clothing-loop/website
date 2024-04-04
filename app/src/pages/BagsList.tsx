import {
  IonButton,
  IonButtons,
  IonCard,
  IonCol,
  IonContent,
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
  closeOutline,
  construct,
  ellipsisHorizontal,
  ellipsisHorizontalCircleOutline,
} from "ionicons/icons";
import type { IonModalCustomEvent } from "@ionic/core/components";
import {
  useContext,
  useRef,
  useState,
  MouseEvent,
  useMemo,
  useEffect,
} from "react";
import { useTranslation } from "react-i18next";
import { Bag, UID } from "../api/types";
import { bagRemove } from "../api/bag";
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
import wrapIndex from "../utils/wrap_index";
import UserLink from "../components/Bags/UserLink";
import SelectUserModal from "../components/Bags/SelectUserModal";
import { useDebounce } from "@uidotdev/usehooks";
import dayjs from "../dayjs";

type State = { bag_id?: number } | undefined;

type Sort =
  | "1ToN"
  | "aToZ"
  | "dateCreated"
  | "dateLastSwapped"
  | "dateLastSwappedRev";

const MIN_BAG_LIST = 9;

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
  const [sort, setSort] = useState<Sort>("1ToN");

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

  const [search, setSearch] = useState("");
  const slowSearch = useDebounce(search, 500);
  const [bagsCard, bagsList] = useMemo(() => {
    if (!authUser) return [[], []];
    let authRouteIndex = authUser ? route.indexOf(authUser.uid) : -1;

    let indexAllowed: number[] = [];
    const routeLength = route.length;
    if (authRouteIndex !== -1) {
      indexAllowed = [
        wrapIndex(authRouteIndex - 2, routeLength),
        wrapIndex(authRouteIndex - 1, routeLength),
        authRouteIndex,
        wrapIndex(authRouteIndex + 1, routeLength),
        wrapIndex(authRouteIndex + 2, routeLength),
      ];
    }

    let filteredBags = bags;
    if (search) {
      filteredBags = bags.filter((bag) =>
        bag.number
          .toLowerCase()
          .replaceAll(" ", "")
          .includes(slowSearch.toLowerCase().replaceAll(" ", "")),
      );
    }

    let _bagsCard: Bag[] = [];
    let _bagsList: Bag[] = [];
    if (sort !== "1ToN") {
      switch (sort) {
        case "aToZ":
          _bagsList = filteredBags.toSorted((a, b) =>
            a.number.localeCompare(b.number),
          );
          break;
        case "dateCreated":
          _bagsList = filteredBags.toSorted((a, b) => (a.id > b.id ? 1 : 0));
          break;
        case "dateLastSwapped":
          _bagsList = filteredBags.toSorted((a, b) =>
            dayjs(b.updated_at).diff(a.updated_at),
          );
          break;
        case "dateLastSwappedRev":
          _bagsList = filteredBags.toSorted((a, b) =>
            dayjs(a.updated_at).diff(b.updated_at),
          );
          break;
      }
    } else if (bagListView === "card") {
      _bagsCard = filteredBags;
    } else if (bagListView === "list") {
      _bagsList = filteredBags;
    } else {
      if (filteredBags.length < MIN_BAG_LIST) {
        _bagsCard = filteredBags;
      } else {
        filteredBags.forEach((bag) => {
          let isMe = authUser?.uid === bag.user_uid;
          let routeIndex = route.indexOf(bag.user_uid);
          let isClosest = indexAllowed.indexOf(routeIndex) !== -1;

          if (isMe || isClosest) {
            _bagsCard.push(bag);
          }
        });

        _bagsList = filteredBags;
      }
    }
    return [_bagsCard, _bagsList];
  }, [bags, route, bagListView, slowSearch, sort]);

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
            <IonButton id="sheet-bags-options">
              <IonIcon icon={ellipsisHorizontalCircleOutline} />
              {slowSearch ? (
                <div className="tw-rounded-full tw-w-2 tw-h-2 tw-absolute tw-bottom-1 tw-right-0 tw-bg-danger"></div>
              ) : null}
            </IonButton>
            <IonModal
              trigger="sheet-bags-options"
              initialBreakpoint={0.8}
              breakpoints={[0, 0.4, 0.8, 1]}
            >
              <IonContent color="light">
                <IonList>
                  <IonItem lines="full" className="tw-mt-2">
                    <IonSearchbar
                      onIonInput={(e) => setSearch(e.detail.value as string)}
                      onIonClear={() => setSearch("")}
                      value={search}
                      placeholder={t("search")}
                    ></IonSearchbar>
                  </IonItem>
                  <IonItem lines="full" color="light">
                    <p className="tw-font-bold">{t("display")}</p>
                  </IonItem>
                  <IonRadioGroup
                    value={bagListView}
                    onIonChange={(e: any) => setBagListView(e.detail.value)}
                  >
                    {["dynamic", "list", "card"].map((v) => (
                      <IonItem lines="full" key={v}>
                        <IonLabel>
                          <h2
                            className={`tw-text-lg ${
                              bagListView === v ? "!tw-font-semibold" : ""
                            }`}
                          >
                            {v === "dynamic" ? t("automatic") : t(v)}
                          </h2>
                        </IonLabel>
                        <IonRadio
                          slot="end"
                          value={v}
                          disabled={sort !== "1ToN"}
                        />
                      </IonItem>
                    ))}
                  </IonRadioGroup>
                  <IonItem lines="full" color="light">
                    <p className="tw-font-bold">{t("sort")}</p>
                  </IonItem>
                  <IonRadioGroup
                    value={sort}
                    onIonChange={(e: any) => {
                      setSort(e.detail.value);
                    }}
                  >
                    {(
                      [
                        "1ToN",
                        "dateLastSwapped",
                        "dateLastSwappedRev",
                        "aToZ",
                        "dateCreated",
                      ] as Sort[]
                    ).map((v) => (
                      <IonItem lines="full" key={v}>
                        <IonLabel>
                          <h2
                            className={`tw-text-lg ${
                              sort === v ? "!tw-font-semibold" : ""
                            }`}
                          >
                            {t(v)}
                          </h2>
                        </IonLabel>
                        <IonRadio slot="end" value={v} />
                      </IonItem>
                    ))}
                  </IonRadioGroup>
                </IonList>
              </IonContent>
            </IonModal>
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
