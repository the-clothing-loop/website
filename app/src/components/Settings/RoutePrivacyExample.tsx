import { IonIcon, IonList } from "@ionic/react";
import AddressListItem from "../AddressList/AddressListItem";
import { Bag, User } from "../../api/types";
import { useMemo } from "react";
import { eyeOffOutline } from "ionicons/icons";
import { useTranslation } from "react-i18next";

const pausedIndex = 4;
const meIndex = 2;

export default function RoutePrivacyExample(props: {
  authUserName: string;
  routePrivacy: number;
}) {
  const { t } = useTranslation();
  const arr = useMemo(() => {
    const exampleList: User[] = [
      "Beatrice",
      "Anna",
      "Isabella",
      "Emma",
      "Charlotte",
      "Sofia",
      "Violet",
    ].map((name, i) => ({
      uid: i + "",
      name,
      email: name + "@example.com",
      phone_number: "0612345678",
      email_verified: true,
      chains: [] as User["chains"],
      address: t("nAddress", { name }),
      sizes: [],
      is_root_admin: false,
      paused_until: i === pausedIndex - 1 ? "2104-06-12T15:23:23Z" : null,
      i18n: "en",
    }));

    const arr1 = exampleList.slice(undefined, 2);
    const arr2 = exampleList.slice(2);
    const me: User = {
      uid: "-1",
      name: props.authUserName,
      email: props.authUserName + "@example.com",
      phone_number: "0612345678",
      email_verified: true,
      chains: [] as User["chains"],
      address: t("nAddress", { name: props.authUserName }),
      sizes: [],
      is_root_admin: false,
      paused_until: null,
      i18n: "en",
    };
    return [...arr1, me, ...arr2];
  }, [props.authUserName]);
  return (
    <IonList className="tw-w-full">
      {arr.map((user, i) => {
        let distance =
          i < meIndex
            ? meIndex - i
            : i >= pausedIndex
            ? i - meIndex - 1
            : i - meIndex;
        const isPrivate =
          i == meIndex
            ? false
            : props.routePrivacy == -1
            ? false
            : props.routePrivacy < distance;
        return (
          <div className="tw-relative tw-w-full" key={user.uid}>
            <div
              className={"tw-absolute tw-z-10".concat(
                isPrivate || user.paused_until
                  ? " tw-flex tw-justify-center tw-items-center tw-w-full tw-h-full"
                  : " tw-hidden",
              )}
            >
              <IonIcon
                icon={eyeOffOutline}
                size="large"
                className="tw-text-purple"
              />
            </div>
            <AddressListItem
              user={user}
              isMe={i === meIndex}
              bags={[] as Bag[]}
              isHost={user.uid === "7"}
              isAddressPrivate={isPrivate}
              isUserPaused={user.paused_until !== null}
              number={i + 5}
              routerLink={undefined}
            />
          </div>
        );
      })}
    </IonList>
  );
}
