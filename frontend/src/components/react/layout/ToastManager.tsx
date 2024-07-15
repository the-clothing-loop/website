import { useStore } from "@nanostores/react";
import {
  closeModal,
  closeToast,
  openModal,
  toasts,
  type Modal,
  type ToastWithID,
  type FormDataEntries,
  type ModalAction,
} from "../../../stores/toast";
import {
  type SyntheticEvent,
  type MouseEvent,
  useRef,
  useEffect,
  type FormEvent,
} from "react";
import { useTranslation } from "react-i18next";

export default function ToastManager() {
  const $openModal = useStore(openModal);
  const $toasts = useStore(toasts);

  return (
    <>
      <ol
        className={`toast fixed toast-bottom sm:toast-right lg:toast-top toast-center z-50 ${
          $toasts.length ? "" : "hidden"
        }`}
      >
        {$toasts.map((t) => (
          <ToastComponent toast={t} closeFunc={closeToast} key={t.id} />
        ))}
      </ol>
      {$openModal ? (
        <ModalComponent modal={$openModal} closeFunc={closeModal} key="modal" />
      ) : null}
    </>
  );
}

function ToastComponent(props: {
  toast: ToastWithID;
  closeFunc: (id: number) => void;
}) {
  let classes = "p-4 shadow-lg border";
  let icon = "mr-3 icon";
  switch (props.toast.type) {
    case "info":
      icon += " icon-info";
      classes += " bg-base-100 border-teal";
      break;
    case "success":
      classes += " bg-success border-success";
      icon += " icon-check-circle";
      break;
    case "warning":
      classes += " bg-yellow border-yellow";
      icon += " icon-alert-triangle";
      break;
    case "error":
      classes += " bg-error border-error";
      icon += " icon-octagon-alert";
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
    if (props.modal.forceOpen) return;
    if (window.innerWidth > 900) {
      if (e.target === e.currentTarget) {
        props.closeFunc();
      }
    }
  }

  // When clicking the Escape button the modal is closed
  // except for when the modal is set to "forceOpen".
  function handleEsc(e: SyntheticEvent<Element>) {
    if (props.modal.forceOpen) {
      e.preventDefault();
    }
  }

  return (
    <dialog
      className="fixed overflow-visible inset-0 z-50 open:flex justify-center items-center p-0 shadow-lg backdrop:bg-white/30"
      ref={refDisplay}
      tabIndex={-1}
      onCancel={handleEsc}
    >
      <div className="fixed inset-0 z-0" onClick={handleBackgroundClick}></div>
      <form
        className="bg-white max-w-screen-sm p-6 z-10"
        style={{ "--tw-shadow": "#333" } as any}
      >
        <h5 className="text-lg mb-6 min-w-[300px]">{props.modal.message}</h5>
        {props.modal.content ? props.modal.content() : null}
        <div
          className={
            props.modal.actions.length === 1 && !props.modal.forceOpen
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
            className={
              props.modal.forceOpen ? "hidden" : "btn btn-sm btn-ghost"
            }
            onClick={() => props.closeFunc()}
          >
            {props.modal.actions.length ? t("cancel") : t("close")}
          </button>
        </div>
      </form>
    </dialog>
  );
}
