import {
  createContext,
  FormEvent,
  MouseEvent,
  PropsWithChildren,
  useEffect,
  useRef,
  useState,
} from "react";
import { useTranslation } from "react-i18next";

export interface Toast {
  type: "info" | "success" | "warning" | "error";
  message: string;
}
export interface Modal {
  message: string;
  content?: () => JSX.Element;
  actions: ModalAction[];
}
export interface ModalAction {
  type: "ghost" | "default" | "primary" | "secondary" | "success" | "error";
  text: string;
  fn: (e: FormDataEntries<any> | undefined) => void | Error;
  submit?: boolean;
}

export type FormDataEntries<E> = ReturnType<typeof Object.fromEntries<E>>;

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
    if (status >= 500)
      window.goscope2.Log(status < 600 ? "ERROR" : "FATAL", msg);
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
  const refDisplay = useRef<HTMLDialogElement>(null);
  const refButtonClose = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    refDisplay.current?.showModal();
    setTimeout(() => {
      refButtonClose.current?.focus();
    });
  }, [props.modal]);

  function handleActionClick(e: FormEvent, a: ModalAction) {
    e.preventDefault();

    let elForm = (e.target as any).form as HTMLFormElement | undefined;
    let formProps: FormDataEntries<any> | undefined;
    if (elForm) {
      formProps = Object.fromEntries(new FormData(elForm));
    }
    let err = a.fn(formProps);
    if (err) {
      console.warn(err);
    } else {
      props.closeFunc();
    }
  }

  function handleBackgroundClick(e: MouseEvent) {
    e.preventDefault();
    if (window.innerWidth > 900) {
      if (e.target === e.currentTarget) {
        props.closeFunc();
      }
    }
  }

  return (
    <dialog
      className="fixed overflow-visible inset-0 z-50 open:flex justify-center items-center p-0 shadow-lg backdrop:bg-white/30"
      ref={refDisplay}
      tabIndex={-1}
      onClick={handleBackgroundClick}
    >
      <form
        className="bg-white max-w-screen-sm p-6 z-10"
        style={{ "--tw-shadow": "#333" } as any}
      >
        <h5 className="text-lg mb-6 min-w-[300px]">{props.modal.message}</h5>
        {props.modal.content ? <props.modal.content /> : null}
        <div
          className={
            props.modal.actions.length === 1
              ? "mt-4 flex justify-between"
              : "mt-4 flex flex-col items-stretch gap-3"
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
              case "primary":
                classes += " btn-primary";
                break;
              case "secondary":
                classes += " btn-ghost bg-teal-light text-teal";
                break;
            }
            return (
              <button
                key={a.text}
                type={a.submit ? "submit" : "button"}
                className={classes}
                onClick={(e) => handleActionClick(e, a)}
              >
                {a.text}
              </button>
            );
          })}
          <button
            key="close"
            type="reset"
            ref={refButtonClose}
            className="btn btn-sm btn-ghost"
            onClick={() => props.closeFunc()}
          >
            {props.modal.actions.length ? t("cancel") : t("close")}
          </button>
        </div>
      </form>
    </dialog>
  );
}
