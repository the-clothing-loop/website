import {
  createContext,
  PropsWithChildren,
  useEffect,
  useRef,
  useState,
} from "react";
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
  type: "ghost" | "default" | "secondary" | "success" | "error";
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
  const { t } = useTranslation();

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
    setTimeout(() => {}, 0);
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
            <ToastComponent toast={t} closeFunc={closeToast} />
          ))}
        </ol>
        {openModal ? (
          <ModalComponent modal={openModal} closeFunc={closeModal} />
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
  let classes = "alert";
  let icon = "feather";
  switch (props.toast.type) {
    case "info":
      classes += " ";
      icon += " feather-info";
      break;
    case "success":
      classes += " alert-success text-base-100";
      icon += " feather-check-circle";
      break;
    case "warning":
      classes += " alert-warning text-base-100";
      icon += " feather-alert-triangle";
      break;
    case "error":
      classes += " alert-error text-base-100";
      icon += " feather-alert-octagon";
      break;
  }

  return (
    <li className={classes} key={props.toast.id}>
      <div className="w-[300px]">
        <span className={icon}></span>
        <span className="font-bold">{props.toast.message}</span>
      </div>
    </li>
  );
}

function ModalComponent(props: { modal: Modal; closeFunc: () => void }) {
  const { t } = useTranslation();
  let ref = useRef<any>();

  function handleActionClick(fn: () => void) {
    props.closeFunc();
    fn();
  }
  function handleBackgroundClick() {
    if (window.innerWidth > 900) props.closeFunc();
  }

  useEffect(() => {
    const trap = focusTrap.createFocusTrap(ref.current as HTMLDialogElement);
    trap.activate();

    return () => {
      trap.deactivate();
    };
  }, []);

  return (
    <dialog
      key="modal"
      className="fixed inset-0 z-50 flex justify-center items-center"
      tabIndex={-1}
      ref={ref}
    >
      <div
        className={"absolute inset-0 bg-white/30"}
        onClick={handleBackgroundClick}
      />
      <div
        className="bg-white max-w-screen-sm p-6 shadow-lg z-10"
        role="document"
      >
        <h5 className="text-lg mb-6">{props.modal.message}</h5>
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
            className="btn btn-sm btn-ghost"
            onClick={() => props.closeFunc()}
          >
            {t("close")}
          </button>
        </div>
      </div>
    </dialog>
  );
}
