import { createContext, PropsWithChildren, useState } from "react";
import { useTranslation } from "react-i18next";

interface ToastAction {
  fn: () => void;
  type: "ghost" | "primary" | "secondary";
  text: string;
}
export interface Toast {
  type: "info" | "success" | "warning" | "error";
  message: string;
  actions?: ToastAction[];
}

type ToastWithID = Toast & { id: number };
interface ContextValue {
  addToast: (t: Toast) => void;
  addToastError: (msg: string) => void;
  addStaticToast: (t: Toast) => void;
}

export const ToastContext = createContext<ContextValue>({
  addToast: (t) => {},
  addToastError: (msg: string) => {},
  addStaticToast: (t) => {},
});

export function ToastProvider({ children }: PropsWithChildren<{}>) {
  const { t } = useTranslation();

  const [toasts, setToasts] = useState<ToastWithID[]>([]);
  const [idIndex, setIdIndex] = useState(1);

  function addToast(t: Toast) {
    const id = idIndex;
    setIdIndex(idIndex + 1);
    setToasts([...toasts, { ...t, id }]);

    setTimeout(() => {
      setToasts((s) => s.filter((t) => t.id !== id));
    }, 7000);
  }

  function addStaticToast(toast: Toast) {
    const id = idIndex;
    setIdIndex(idIndex + 1);
    setToasts([
      ...toasts,
      {
        ...toast,
        id,
        actions: [
          ...(toast.actions || []),
          {
            text: t("close"),
            type: "ghost",
            fn: () => {
              setToasts((s) => s.filter((t) => t.id !== id));
            },
          },
        ],
      },
    ]);
  }

  function addToastError(msg: string) {
    // ensure that message is a string during runtime
    msg = msg + "";
    addToast({
      type: "error",
      message: msg,
      actions: [
        {
          fn: () => {
            navigator.clipboard.writeText(msg);
          },
          type: "ghost",
          text: t("copy"),
        },
      ],
    });
  }

  function CreateToastComponent(t: ToastWithID) {
    let classes = "alert";
    let icon = "feather";
    switch (t.type) {
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
      <li className={classes} key={t.id}>
        <div className="w-[300px]">
          <span className={icon}></span>
          <span className="font-bold">{t.message}</span>
        </div>
        {t.actions && (
          <div className="flex-none">
            {t.actions?.map((a) => {
              let classes = "btn btn-sm";
              switch (a.type) {
                case "ghost":
                  classes += " btn-ghost";
                  break;
                case "primary":
                  classes += " btn-primary";
                  break;
                case "secondary":
                  classes += " btn-secondary";
                  break;
              }
              return (
                <button className={classes} onClick={a.fn}>
                  {a.text}
                </button>
              );
            })}
          </div>
        )}
      </li>
    );
  }

  return (
    <ToastContext.Provider value={{ addToast, addToastError, addStaticToast }}>
      <>
        <ol
          className={`toast fixed toast-bottom sm:toast-right lg:toast-top toast-center z-50 ${
            toasts.length ? "" : "hidden"
          }`}
        >
          {toasts.map(CreateToastComponent)}
        </ol>
        {children}
      </>
    </ToastContext.Provider>
  );
}
