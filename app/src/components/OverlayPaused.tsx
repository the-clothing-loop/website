import { IonButton, IonCard, IonCardContent, IonIcon } from "@ionic/react";
import { useContext, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { IsChainAdmin, StoreContext } from "../Store";
import { User } from "../api";
import { openOutline } from "ionicons/icons";
import { useHistory } from "react-router";
import { OverlayContainsState, OverlayState } from "../utils/overlay_open";

export default function OverlayPaused() {
  const { t } = useTranslation();
  const history = useHistory();
  const { chain, chainUsers, refresh, authUser, overlayState, closeOverlay } =
    useContext(StoreContext);

  const hosts = useMemo<User[]>(
    () => chainUsers.filter((u) => IsChainAdmin(u, chain?.uid)),
    [chainUsers, chain],
  );

  function goToSettings() {
    refresh("settings").then(() => {
      history.replace("/settings", { openChainSelect: true });
    });
  }

  const isUserHost =
    authUser?.chains.find((uc) => uc.chain_uid === chain?.uid)
      ?.is_chain_admin || false;

  let isExplicitlyPublished = chain === null ? true : chain.published;

  if (
    isExplicitlyPublished ||
    OverlayContainsState(overlayState, OverlayState.CLOSE_PAUSED)
  )
    return null;
  return (
    <div className="tw-absolute tw-inset-0">
      <div className="tw-relative tw-z-20 tw-flex tw-h-full tw-flex-col tw-justify-center tw-items-center tw-text-center">
        <IonCard className="tw-bg-background">
          <IonCardContent className="tw-text-text">
            <h1 className="!tw-mb-4">{t("loopIsNotPublished")}</h1>
            {isUserHost ? null : (
              <>
                <p className="!tw-mb-3">{t("pleaseContactYourLoopHost")}</p>
                <div className="tw-flex tw-justify-center tw-flex-wrap tw-mt-1.5 tw-m-0 tw-mb-2.5">
                  {hosts.map((host) => (
                    <IonButton
                      key={host.uid}
                      size="small"
                      routerLink={"/address/" + host.uid}
                      color="light"
                      className="tw-m-1.5 tw-text-base"
                    >
                      {host.name}
                    </IonButton>
                  ))}
                </div>
              </>
            )}
            {isUserHost ? (
              <IonButton
                href={`https://clothingloop.org/loops/${chain?.uid}/members`}
                target="_blank"
                expand="block"
                className="tw-mb-4"
              >
                {t("editLoop")}
                <IonIcon slot="end" icon={openOutline}></IonIcon>
              </IonButton>
            ) : null}
            <IonButton
              onClick={goToSettings}
              expand="block"
              color={isUserHost ? "light" : "primary"}
            >
              {t("selectADifferentLoop")}
            </IonButton>
            {isUserHost ? (
              <IonButton
                expand="block"
                className="tw-mt-4"
                color="light"
                onClick={() => closeOverlay(OverlayState.CLOSE_PAUSED)}
              >
                {t("hide")}
              </IonButton>
            ) : null}
          </IonCardContent>
        </IonCard>
      </div>
    </div>
  );
}
