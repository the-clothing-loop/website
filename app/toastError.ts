import type { UseIonToastResult } from "@ionic/react";

export default function toastError(present: UseIonToastResult[0], err: any) {
  let message = "Unknown error occurred";
  if (typeof err === "string") message = err;
  if (typeof err.data === "string") message = err.data;
  if (typeof err.message === "string") message = err.message;
  console.log(err);

  present({
    message,
    color: "danger",
    duration: 1500,
    position: "top",
  });
}
