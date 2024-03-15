import { expect, test } from "vitest";
import isSSR from "./is_ssr";

test("server side rendering check", () => {
  //@ts-ignore
  globalThis["window"] = undefined;
  expect(isSSR(), "without globalThis.window you are running in node");
  //@ts-ignore
  globalThis["window"] = true;
  expect(!isSSR(), "with globalThis.window you are running in browser");
});
