import type { JSX } from "react";
import { atom } from "nanostores";

export interface Toast {
  type: "info" | "success" | "warning" | "error";
  message: string;
}
export type ToastWithID = Toast & { id: number };
export interface Modal {
  message: string;
  content?: () => JSX.Element;
  actions: ModalAction[];
  forceOpen?: boolean;
}
export interface ModalAction {
  type: "ghost" | "default" | "primary" | "secondary" | "success" | "error";
  text: string;
  fn: (e: FormDataEntries<any> | undefined) => void | Error;
  submit?: boolean;
}

export type FormDataEntries<E> = ReturnType<typeof Object.fromEntries<E>>;

export const toasts = atom<ToastWithID[]>([]);
export const openModal = atom<Modal | undefined>(undefined);
export const selectedToastIndex = atom(1);

export function addToast(t: Toast) {
  const id = selectedToastIndex.get();
  selectedToastIndex.set(id + 1);
  toasts.set([...toasts.get(), { ...t, id }]);

  setTimeout(() => {
    toasts.set(toasts.get().filter((t) => t.id !== id));
  }, 5000);
}

export function addModal(modal: Modal) {
  openModal.set(modal);
}

export function addToastError(msg: string, status = 999) {
  // ensure that message is a string during runtime
  if (typeof msg === "object") {
    msg = JSON.stringify(msg);
  }
  msg = msg + "";
  addToast({
    type: "error",
    message: msg,
  });
}

export function closeToast(id: number) {
  toasts.set(toasts.get().filter((t) => t.id !== id));
}

export function closeModal() {
  openModal.set(undefined);
}
