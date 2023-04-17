import type { UseIonToastResult } from "@ionic/react";

export default function toastError(present: UseIonToastResult[0], err: any) {
  let message = "unknown error occurred";
  if (err.body) message = err.body;
  if (typeof err === "string") message = err;
  present({
    message,
    duration: 1500,
    position: "top",
  });
}
