import { useTranslation } from "react-i18next";
import { Chain } from "../../api/types";
import { LegacyRef, useRef, MouseEvent } from "react";
import RouteMap from "./RouteMap";

export default function RouteMapPopup(props: {
  chain: Chain;
  closeFunc: () => void;
  routeWasOptimized: boolean;
  optimizeRoute: () => void;
  returnToPreviousRoute: () => void;
}) {
  const { t } = useTranslation();
  const ref = useRef<HTMLDialogElement>(null);
  const refButtonClose = useRef<HTMLButtonElement>(null);

  function handleBackgroundClick(e: MouseEvent) {
    e.preventDefault();
    if (window.innerWidth > 900) {
      if (e.target === e.currentTarget) {
        props.closeFunc();
      }
    }
  }

  return (
    <div className="absolute inset-0 p-4 bg-white/30">
      <dialog
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
          <h5 className="text-lg mb-6 min-w-[300px]">{t("map")}</h5>
          <div className="flex-grow">
            <RouteMap
              centerLatitude={props.chain.latitude}
              centerLongitude={props.chain.longitude}
              chainUID={props.chain.uid}
            />
          </div>
          <div className="mt-4 flex justify-between">
            {props.routeWasOptimized ? (
              <button
                type="button"
                className="btn btn-sm btn-ghost bg-teal-light text-teal"
                onClick={props.returnToPreviousRoute}
              >
                {t("routeUndoOptimize")}
                <span className="feather feather-corner-left-up ms-2" />
              </button>
            ) : (
              <button
                type="button"
                className="btn btn-sm btn-ghost bg-teal-light text-teal"
                onClick={props.optimizeRoute}
              >
                {t("optimize")}
                <span className="feather feather-zap ms-2" />
              </button>
            )}
            <button
              key="close"
              type="reset"
              ref={refButtonClose}
              className="btn btn-sm btn-ghost"
              onClick={() => props.closeFunc()}
            >
              {t("close")}
            </button>
          </div>
        </form>
      </dialog>
    </div>
  );
}
