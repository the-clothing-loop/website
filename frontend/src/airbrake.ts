import { Notifier } from "@airbrake/browser";

const AIRBREAK_ID = parseInt(import.meta.env.VITE_AIRBREAK_ID || "");
const AIRBREAK_KEY = import.meta.env.VITE_AIRBREAK_KEY;
const AIRBREAK_ENV = import.meta.env.VITE_AIRBREAK_ENV;

// function instrumentConsole(notifier: Notifier): void {
//   const oldFn = window.console.error;

//   let newFn = (...args: any[]) => {
//     oldFn(...args);
//     notifier.notify({
//       error: typeof args[0] === "string" ? args[0] : JSON.stringify(args[0]),
//       context: args,
//     });
//   };
//   window.console.error = newFn as any;
// }

if (AIRBREAK_ID && AIRBREAK_KEY && AIRBREAK_ENV && window) {
  //@ts-ignore
  const airbrake = new Notifier({
    projectId: AIRBREAK_ID,
    projectKey: AIRBREAK_KEY,
    environment: AIRBREAK_ENV,
    instrumentation: {
      // console: false,
    },
  });
  //@ts-ignore
  window.airbrake = airbrake;
}
