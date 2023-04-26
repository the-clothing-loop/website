import type { UseIonToastResult } from "@ionic/react";

export default function toastError(present: UseIonToastResult[0], err: any) {
  let message = "unknown error occurred";
  if (typeof err === "string") message = err;
  if (err.data) message = err.body;
  if (typeof err.message === "string") message = err.message;
  console.log(err);

  present({
    message,
    color: "danger",
    duration: 1500,
    position: "top",
  });
}
