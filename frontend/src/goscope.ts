import "goscope2-sdk-js/sdk/js";
import type { Severity } from "goscope2-sdk-js/sdk/js";

const token = import.meta.env.VITE_GOSCOPE2_TOKEN;
if (token && window) {
  window.goscope2.New(token, "/api");

  injectConsole("error", "ERROR");
}

function injectConsole(
  consoleKey: "info" | "warn" | "error",
  severity: Severity
): void {
  const oldFn = window.console[consoleKey];

  let newFn = (...args: any[]) => {
    oldFn(...args);
    let message = "";
    if (typeof args[0] === "string") {
      message = args[0];
      if (args.length > 1) {
        message += " " + JSON.stringify(args.slice(1));
      }
    } else {
      message = JSON.stringify(args);
    }
    window.goscope2.Log(severity, message);
  };
  window.console[consoleKey] = newFn as any;
}
