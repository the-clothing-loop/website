import type { Chain, UID, User } from "../../../../api/types";
import { useRef, type MouseEvent, useState } from "react";
import RouteMap from "./RouteMap";
import { useTranslation } from "react-i18next";

export default function RouteMapPopup(props: {
  chain: Chain;
  closeFunc: (save: boolean) => void;
  route: UID[];
  shouldSave: boolean;
  optimizeRoute: () => Promise<void>;
  returnToPreviousRoute: () => void;
}) {
  const { t } = useTranslation();
  const ref = useRef<HTMLDialogElement>(null);
  const refButtonClose = useRef<HTMLButtonElement>(null);
  const [routeWasOptimized, setRouteWasOptimized] = useState(false);

  function returnToPreviousRoute() {
    props.returnToPreviousRoute();
    setRouteWasOptimized(false);
  }

  function optimizeRoute() {
    props.optimizeRoute().then(
      () => {
        setRouteWasOptimized(true);
      },
      () => {
        setRouteWasOptimized(false);
      },
    );
  }

  function handleBackgroundClick(e: MouseEvent) {
    e.preventDefault();
    if (window.innerWidth > 900) {
      if (e.target === e.currentTarget) {
        props.closeFunc(false);
      }
    }
  }

  return (
    <div className="fixed w-screen lg:w-full h-screen lg:h-full lg:absolute z-[70] inset-0 px-4 bg-white/30 lg:block">
      <dialog
        id="routemappopup"
        open
        className="relative w-full h-full flex p-0 shadow-lg"
        ref={ref}
        tabIndex={-1}
        onClick={handleBackgroundClick}
      >
        <form
          className="flex flex-col bg-white w-full h-full p-6"
          style={{ "--tw-shadow": "#333" } as any}
        >
          <div className="flex-grow">
            <RouteMap chain={props.chain} route={props.route} />
          </div>
          <div className="mt-4 flex justify-between">
            {routeWasOptimized ? (
              <button
                type="button"
                className="btn btn-sm btn-ghost bg-teal-light text-teal"
                onClick={returnToPreviousRoute}
              >
                {t("routeUndoOptimize")}
                <span className="feather feather-corner-left-up ms-2" />
              </button>
            ) : (
              <button
                type="button"
                className="btn btn-sm btn-ghost bg-teal-light text-teal"
                onClick={optimizeRoute}
              >
                {t("routeOptimize")}
                <span className="feather feather-zap ms-2" />
              </button>
            )}
            <div>
              {props.shouldSave ? (
                <>
                  <button
                    key="save"
                    type="reset"
                    ref={refButtonClose}
                    className="btn btn-sm btn-success me-2"
                    onClick={() => props.closeFunc(true)}
                  >
                    {t("save")}
                  </button>
                  <button
                    key="cancel"
                    type="reset"
                    ref={refButtonClose}
                    className="btn btn-sm btn-ghost"
                    onClick={() => props.closeFunc(false)}
                  >
                    {t("cancel")}
                  </button>
                </>
              ) : (
                <button
                  key="close"
                  type="reset"
                  ref={refButtonClose}
                  className="btn btn-sm btn-ghost"
                  onClick={() => props.closeFunc(false)}
                >
                  {t("close")}
                </button>
              )}
            </div>
          </div>
        </form>
      </dialog>
    </div>
  );
}
