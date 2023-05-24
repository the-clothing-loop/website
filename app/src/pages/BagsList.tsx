import {
  AlertInput,
  IonButton,
  IonButtons,
  IonCard,
  IonCardHeader,
  IonCardSubtitle,
  IonCardTitle,
  IonCol,
  IonContent,
  IonGrid,
  IonHeader,
  IonIcon,
  IonPage,
  IonRefresher,
  IonRefresherContent,
  IonRow,
  IonTitle,
  IonToolbar,
  RefresherEventDetail,
  useIonAlert,
} from "@ionic/react";
import { trashBin, closeCircleOutline } from "ionicons/icons";
import { useContext, useRef, useState, MouseEvent } from "react";
import { useTranslation } from "react-i18next";
import { Bag, bagPut, bagRemove, UID } from "../api";
import CreateBag from "../components/CreateUpdateBag";
import { StoreContext } from "../Store";
import dayjs from "../dayjs";
import { Sleep } from "../utils/sleep";
import { useLongPress } from "use-long-press";

export default function BagsList() {
  const { t } = useTranslation();
  const { chain, chainUsers, bags, setChain, authUser, route } =
    useContext(StoreContext);
  const modal = useRef<HTMLIonModalElement>(null);
  const [presentAlert] = useIonAlert();
  // -1: nothing is shown
  //  0: everything is shown
  //  n: that bag id is shown
  const [openCard, setOpenCard] = useState(-1);
  const [updateBag, setUpdateBag] = useState<Bag | null>(null);

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
      header: "Delete Bag",
      message: "Are you sure you want to delete bag number " + bagNo + "?",
      buttons: [
        {
          text: "Cancel",
        },
        {
          text: "Delete",
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
    const handler = async (e: UID) => {
      console.log(e);

      if (typeof e !== "string" || !e) return;
      await bagPut({
        chain_uid: chain!.uid,
        user_uid: authUser!.uid,
        holder_uid: e,
        bag_id: bagID,
      });
      await setChain(chain, authUser!.uid);
    };

    let inputs: AlertInput[] = [];
    route.forEach((r, i) => {
      const user = chainUsers.find((u) => u.uid === r);
      if (!user) return;
      const isChecked = user.uid === currentHolder;
      inputs.push({
        label: `#${i + 1} ${user.name}`,
        type: "radio",
        value: user.uid,
        checked: isChecked,
      });
    });
    presentAlert({
      header: t("changeBagHolder"),
      message: t("selectTheNewBagHolder"),
      inputs,
      buttons: [
        {
          text: t("cancel"),
        },
        {
          text: t("change"),
          handler,
        },
      ],
    });
  }

  function handleClickCreate() {
    setUpdateBag(null);
    modal.current?.present();
  }
  function handleClickEditAll() {
    setOpenCard(openCard === 0 ? -1 : 0);
  }

  return (
    <IonPage>
      <IonHeader translucent>
        <IonToolbar>
          <IonButtons slot="start">
            <IonButton onClick={handleClickEditAll}>{t("edit")}</IonButton>
          </IonButtons>

          <IonTitle>{t("bags")}</IonTitle>

          <IonButtons slot="end">
            <IonButton onClick={handleClickCreate}>{t("create")}</IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <IonHeader collapse="condense">
          <IonToolbar>
            <IonTitle size="large">{t("bags")}</IonTitle>
          </IonToolbar>
        </IonHeader>
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
              {bags.map((bag) => {
                const user = chainUsers.find((u) => u.uid === bag.user_uid);
                if (!user) return null;
                let routeIndex = route.indexOf(user.uid);
                if (routeIndex === -1) return null;
                const bagUpdatedAt = dayjs(bag.updated_at);
                const isBagTooOld = bagUpdatedAt.isBefore(
                  dayjs().add(-7, "days")
                );

                return (
                  <IonCol size="6" key={bag.id}>
                    <Card
                      open={openCard === bag.id || openCard === 0}
                      setOpen={(v) => {
                        setOpenCard(v ? bag.id : -1);
                      }}
                      onClickShort={() => handleClickItem(bag.id, bag.user_uid)}
                      onClickDelete={() =>
                        handleClickDelete(bag.id, bag.number)
                      }
                      onClickEdit={() => handleClickEdit(bag)}
                      className="ion-no-margin"
                      style={{ position: "relative", overflow: "visible" }}
                    >
                      {!isBagTooOld ? (
                        <div
                          key="old"
                          style={{
                            color: "var(--ion-color-danger)",
                            fontSize: 11,
                            display: "block",
                            position: "absolute",
                            top: "5px",
                            left: "10px",
                          }}
                        >
                          {t("old")}
                        </div>
                      ) : null}
                      <div
                        style={{
                          padding: 20,
                          paddingBottom: 0,
                        }}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 47.5 47.5"
                          id="bag"
                        >
                          <defs>
                            <clipPath id="a">
                              <path d="M0 38h38V0H0v38Z"></path>
                            </clipPath>
                          </defs>
                          <g
                            clip-path="url(#a)"
                            transform="matrix(1.25 0 0 -1.25 0 47.5)"
                          >
                            <path
                              fill="#ffac33"
                              d="M29 15a1 1 0 0 0-1 1v6c0 6.065-4.037 11-9 11-4.962 0-9-4.935-9-11v-6a1 1 0 1 0-2 0v6c0 7.168 4.935 13 11 13s11-5.832 11-13v-6a1 1 0 0 0-1-1"
                            ></path>
                            <path
                              fill={bag.color || "#9266cc"}
                              d="M34.386 24.028C34.126 26.213 32.115 28 29.914 28H8.086c-2.2 0-4.212-1.787-4.471-3.972L1.472 5.972C1.212 3.787 2.8 2 5 2h28c2.2 0 3.788 1.787 3.529 3.972l-2.143 18.056Z"
                            ></path>
                            <path
                              fill="#ffd983"
                              d="M29 17a1 1 0 0 0-1 1v6c0 6.065-4.037 11-9 11-4.962 0-9-4.935-9-11v-6a1 1 0 1 0-2 0v6c0 7.168 4.935 13 11 13s11-5.832 11-13v-6a1 1 0 0 0-1-1"
                            ></path>
                          </g>
                        </svg>
                      </div>
                      <div
                        style={{
                          paddingLeft: 10,
                          paddingRight: 10,
                          textAlign: "center",
                          fontWeight: "bold",
                        }}
                      >
                        {bag.number}
                      </div>
                      <IonCardHeader
                        style={{
                          paddingLeft: 10,
                          paddingRight: 10,
                          paddingBottom: 10,
                        }}
                      >
                        <IonCardTitle
                          className="ion-text-ellipsis"
                          style={{ fontSize: 14 }}
                        >
                          {user.name}
                        </IonCardTitle>
                        <IonCardSubtitle
                          style={{ fontSize: 12, textTransform: "none" }}
                        >
                          {t("route") + ": #" + (routeIndex + 1)}
                        </IonCardSubtitle>
                      </IonCardHeader>
                    </Card>
                  </IonCol>
                );
              })}
            </IonRow>
          </IonGrid>
        </div>
        <CreateBag bag={updateBag} modal={modal} didDismiss={refreshBags} />
      </IonContent>
    </IonPage>
  );
}

function Card({
  open,
  setOpen,
  onClickShort,
  onClickEdit,
  onClickDelete,
  children,
  ...props
}: React.ComponentProps<typeof IonCard> & {
  open: boolean;
  setOpen: (v: boolean) => void;
  onClickShort: () => void;
  onClickEdit: () => void;
  onClickDelete: () => void;
}) {
  const { t } = useTranslation();
  // const [open, setOpen] = useState(false);
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
        } else {
          onClickShort();
        }
      },
    }
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
            <IonIcon icon={closeCircleOutline} />
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
