import {
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonItem,
  IonLabel,
  IonList,
  IonModal,
  IonTitle,
  IonToolbar,
} from "@ionic/react";
import dayjs from "../../dayjs";
import { useContext, useRef, useState } from "react";
import { bagHistory, BagHistoryItem } from "../../api/bag";
import { StoreContext } from "../../stores/Store";
import { useTranslation } from "react-i18next";

// type ListBags = {
//   type: "bags";
//   list: Array<{
//     id: string;
//     bagName: string;
//     history: Array<{
//       id: string;
//       name: string;
//       date: Dayjs;
//     }>;
//   }>;
// };
// type ListMembers = {
//   type: "members";
//   list: Array<{
//     id: string;
//     name: string;
//     history: Array<{
//       id: string;
//       bagName: string;
//       days: number;
//     }>;
//   }>;
// };

// function ListBagsToMembers(listBags: ListBags): ListMembers {
//   const res: ListMembers["list"] = [];
//   // const findOrCreate = (userUID, name, bagId, bagName) => {
//   //   const  res.find((v) => v.id === userUID);

//   // };
//   for (const bag of listBags.list) {
//     let prevBagHist;
//     for (const bagHist of bag.history) {
//       if (prevBagHist?.date) {
//         const days = bagHist.date.diff(prevBagHist.date, "days");
//       }
//       prevBagHist = bagHist;
//     }
//   }
//   return {
//     type: "members",
//     list: res,
//   };
// }

export default function BagAnalyticsModal() {
  const { t } = useTranslation();
  const { chain, route } = useContext(StoreContext);
  const ref = useRef<HTMLIonModalElement>(null);
  // const [segmentType, setSegmentType] = useState<"bags" | "members">("bags");
  /*  const list = useMemo<ListBags | ListMembers>(() => {
    if (segmentType === "bags") {
      return {
        type: "bags",
        list: [
          {
            id: "1",
            bagName: "Bag 1",
            history: [
              {
                id: "1",
                name: "Bobby Tables",
                date: dayjs(),
              },
              {
                id: "2",
                name: "Bobby Tables",
                date: dayjs(),
              },
              {
                id: "3",
                name: "Bobby Tables",
                date: dayjs(),
              },
            ],
          },
          {
            id: "2",
            bagName: "Bag 2",
            history: [
              {
                id: "1",
                name: "Bobby Tables",
                date: dayjs(),
              },
              {
                id: "2",
                name: "Bobby Tables",
                date: dayjs(),
              },
              {
                id: "3",
                name: "Bobby Tables",
                date: dayjs(),
              },
            ],
          },
        ],
      } as ListBags;
    }
    return {
      type: "members",
      list: [
        {
          id: "1",
          name: "Bobby Tables",
          history: [
            { id: "1", bagName: "Bag 14", days: 0 },
            { id: "2", bagName: "Bag 1", days: 8 },
            { id: "3", bagName: "Bag 8", days: 1 },
          ],
        },
        {
          id: "2",
          name: "Bobby Tables",
          history: [
            { id: "1", bagName: "Bag 14", days: 0 },
            { id: "2", bagName: "Bag 1", days: 8 },
            { id: "3", bagName: "Bag 8", days: 1 },
          ],
        },
      ],
    } as ListMembers;
  }, [segmentType]); */
  const [data, setData] = useState<BagHistoryItem[] | undefined>();

  function onClose() {
    ref.current?.dismiss();
  }
  // function onSegmentChanged(e: any) {
  //   setSegmentType(e?.detail.value || "bags");
  // }
  function textDate(dStr: string): string {
    if (dStr === "") return "";
    const d = dayjs(dStr);
    if (d.year() === dayjs().year()) {
      return d.format("D MMM");
    }
    return d.format("D MMM, YYYY");
  }
  function onModalPresent() {
    if (!chain) return;
    bagHistory(chain.uid).then((res) => {
      setData(res.data);
    });
  }

  return (
    <IonModal
      trigger="sheet-bags-timeline"
      ref={ref}
      onDidPresent={onModalPresent}
    >
      <IonHeader>
        <IonToolbar>
          <IonTitle>{t("bagAnalytics")}</IonTitle>
          <IonButtons slot="end">
            <IonButton onClick={() => onClose()}>{t("close")}</IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent color="light">
        <IonList lines="full">
          {/* <IonItem lines="none">
            <IonSegment value={segmentType} onIonChange={onSegmentChanged}>
              <IonSegmentButton value="bags">
                <IonLabel>Bags</IonLabel>
              </IonSegmentButton>
              <IonSegmentButton value="members">
                <IonLabel>Members</IonLabel>
              </IonSegmentButton>
            </IonSegment>
          </IonItem> */}
          {/*list.type === "bags"
            ?*/ data?.map((item) => (
            <IonItem key={item.id}>
              <IonLabel>
                <h3>{item.number}</h3>
                <p className="tw-pb-2 tw-flex tw-justify-between">
                  <span>{t("history")}:</span>
                  <span className="tw-text-medium">{t("dateReceived")}</span>
                </p>
                <IonList>
                  {item.history.map((histItem, i) => {
                    /** -1 if not present */
                    const routeUserIndex: number = histItem.uid
                      ? route.indexOf(histItem.uid)
                      : -1;
                    return (
                      <IonItem lines="full" color="light" key={i}>
                        <div
                          slot="start"
                          className="tw-flex tw-items-center tw-text-medium-shade"
                        >
                          {routeUserIndex === -1 ? null : (
                            <span className="!tw-font-bold">{`#${routeUserIndex + 1}`}</span>
                          )}
                        </div>
                        <IonLabel>{histItem.name}</IonLabel>
                        {histItem.date ? (
                          <span slot="end" className="tw-text-medium-shade">
                            {textDate(histItem.date)}
                          </span>
                        ) : null}
                      </IonItem>
                    );
                  })}
                </IonList>
              </IonLabel>
            </IonItem>
          ))
          /*  : list.list.map((item) => (
                <IonItem key={item.id}>
                  <IonLabel>
                    <h3>Bobby Tables</h3>
                    <p className="tw-pb-2">History:</p>
                    <IonList>
                      {item.history.map((histItem) => (
                        <IonItem lines="full" color="light">
                          <IonLabel>{histItem.bagName}</IonLabel>
                          <span slot="end" className="tw-text-medium-shade">
                            {histItem.days + " days"}
                          </span>
                        </IonItem>
                      ))}
                    </IonList>
                  </IonLabel>
                </IonItem>
              ))*/
          }
        </IonList>
      </IonContent>
    </IonModal>
  );
}
