import { createContext, PropsWithChildren, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import * as focusTrap from "focus-trap";

export interface Toast {
  type: "info" | "success" | "warning" | "error";
  message: string;
}
export interface Modal {
  message: string;
  actions: ModalAction[];
}
interface ModalAction {
  fn: () => void;
  type:
    | "ghost"
    | "default"
    | "secondary"
    | "success"
    | "error"
    | "enterLocation";
  text: string;
}

type ToastWithID = Toast & { id: number };
interface ContextValue {
  addToast: (t: Toast) => void;
  addToastError: (msg: string, status: number | undefined) => void;
  addModal: (t: Modal) => void;
}

export const ToastContext = createContext<ContextValue>({
  addToast: (t) => {},
  addToastError: (msg, status) => {},
  addModal: (t) => {},
});

export function ToastProvider({ children }: PropsWithChildren<{}>) {
  const [toasts, setToasts] = useState<ToastWithID[]>([]);
  const [openModal, setOpenModal] = useState<Modal>();
  const [idIndex, setIdIndex] = useState(1);

  function addToast(t: Toast) {
    const id = idIndex;
    setIdIndex(idIndex + 1);
    setToasts([...toasts, { ...t, id }]);

    setTimeout(() => {
      setToasts((s) => s.filter((t) => t.id !== id));
    }, 5000);
  }

  function addModal(modal: Modal) {
    setOpenModal(modal);
  }

  function addToastError(msg: string, status = 999) {
    // ensure that message is a string during runtime
    if (typeof msg === "object") {
      msg = JSON.stringify(msg);
    }
    msg = msg + "";
    if (status >= 500) window.airbrake?.notify(msg);
    addToast({
      type: "error",
      message: msg,
    });
  }

  function closeToast(id: number) {
    setToasts((s) => s.filter((t) => t.id !== id));
  }

  function closeModal() {
    setOpenModal(undefined);
  }

  return (
    <ToastContext.Provider value={{ addToast, addToastError, addModal }}>
      <>
        <ol
          className={`toast fixed toast-bottom sm:toast-right lg:toast-top toast-center z-50 ${
            toasts.length ? "" : "hidden"
          }`}
        >
          {toasts.map((t) => (
            <ToastComponent toast={t} closeFunc={closeToast} key={t.id} />
          ))}
        </ol>
        {openModal ? (
          <ModalComponent
            modal={openModal}
            closeFunc={closeModal}
            key="modal"
          />
        ) : null}
        {children}
      </>
    </ToastContext.Provider>
  );
}

function ToastComponent(props: {
  toast: ToastWithID;
  closeFunc: (id: number) => void;
}) {
  let classes = "p-4 shadow-lg border";
  let icon = "mr-3 feather";
  switch (props.toast.type) {
    case "info":
      icon += " feather-info";
      classes += " bg-base-100 border-teal";
      break;
    case "success":
      classes += " bg-success border-success";
      icon += " feather-check-circle";
      break;
    case "warning":
      classes += " bg-yellow border-yellow";
      icon += " feather-alert-triangle";
      break;
    case "error":
      classes += " bg-error border-error";
      icon += " feather-alert-octagon";
      break;
  }

  return (
    <li className={classes}>
      <div className="w-[300px]">
        <span className={icon}></span>
        <span className="font-bold">{props.toast.message}</span>
      </div>
    </li>
  );
}

function ModalComponent(props: { modal: Modal; closeFunc: () => void }) {
  const { t } = useTranslation();
  const [trap, setTrap] = useState<focusTrap.FocusTrap>();

  function asyncDeactivate() {
    return new Promise((resolve, reject) => {
      if (trap) {
        try {
          trap.deactivate({
            onPostDeactivate: () => {
              resolve(undefined);
            },
          });
        } catch (err) {
          reject(err);
        }
      } else reject(Error("trap not defined"));
    }).catch((err) => {
      console.error(err);
    });
  }

  function handleActionClick(fn: () => void) {
    asyncDeactivate().finally(() => {
      props.closeFunc();
      fn();
    });
  }
  function handleBackgroundClick() {
    if (window.innerWidth > 900) {
      asyncDeactivate().finally(() => {
        props.closeFunc();
      });
    }
  }

  useEffect(() => {
    const trap = focusTrap.createFocusTrap("#toast-modal", {
      initialFocus: "#toast-modal-close",
    });
    try {
      trap.activate();
    } catch (e) {
      console.error(e);
    }
    setTrap(trap);
  }, []);

  return (
    <dialog
      className="fixed inset-0 z-50 flex justify-center items-center p-0"
      id="toast-modal"
      tabIndex={-1}
    >
      <div
        className={"fixed inset-0 bg-white/30"}
        onClick={handleBackgroundClick}
      />
      <div
        className="bg-white max-w-screen-sm container p-6 shadow-lg z-10"
        role="document"
      >
        <h5 className="text-lg mb-6 min-w-[300px]">{props.modal.message}</h5>
        <div
          className={
            props.modal.actions.length === 1
              ? "flex justify-between"
              : "flex flex-col items-stretch gap-3"
          }
        >
          {props.modal.actions.map((a) => {
            let classes = "btn btn-sm";
            switch (a.type) {
              case "ghost":
                classes += " btn-ghost";
                break;
              case "error":
                classes += " btn-error";
                break;
              case "success":
                classes += " btn-success";
                break;
              case "secondary":
                classes += " btn-ghost bg-teal-light text-teal";
                break;
              case "enterLocation":
                return (
                  <div key={a.text} className="">
                    {a.fn()}
                  </div>
                );
            }
            return (
              <button
                key={a.text}
                className={classes}
                onClick={() => handleActionClick(a.fn)}
              >
                {a.text}
              </button>
            );
          })}
          <button
            key="close"
            id="toast-modal-close"
            className="btn btn-sm btn-ghost"
            onClick={() => handleActionClick(() => {})}
          >
            {t("close")}
          </button>
        </div>
      </div>
    </dialog>
  );
}
