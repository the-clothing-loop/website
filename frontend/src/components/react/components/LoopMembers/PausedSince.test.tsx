import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, expect, test, vi } from "vitest";
import type { UserChain } from "../../../../api/types";
import PausedSince from "./PausedSince";

const language = vi.hoisted(() => ({ current: "nl" }));
vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    i18n: { language: language.current },
    t: (key: string, options?: { count: number }) =>
      key === "nDays"
        ? `${options?.count} days`
        : key === "pausedInAllLoops"
          ? "Paused in all loops"
          : "Paused since",
  }),
}));

afterEach(() => vi.useRealTimers());

function render(overrides: Partial<UserChain> = {}) {
  return renderToStaticMarkup(
    createElement(PausedSince, {
      userChain: {
        is_paused: true,
        paused_at: "2026-09-12T12:00:00Z",
        ...overrides,
      } as UserChain,
    }),
  );
}

test("uses a compact localized date and exposes the duration on focus", () => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date("2026-10-21T12:00:00Z"));
  language.current = "nl";
  const html = render();
  expect(html).toContain(">12-09-2026</time>");
  expect(html).toContain('data-tip="39 days"');
  expect(html).toContain("focus:tooltip-open");
  language.current = "en";
  expect(render()).toContain(">09/12/2026</time>");
});

test("hides active participants and does not invent unknown start dates", () => {
  expect(render({ is_paused: false })).toBe("");
  expect(render({ paused_at: undefined })).toContain("<span");
  expect(render({ paused_at: null })).toContain("<span");
  expect(render({ paused_at: "invalid" })).toContain("<span");
});

test("shows general pause status without an end date", () => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date("2026-10-21T12:00:00Z"));
  language.current = "nl";
  const renderUntil = (pausedUntil: string) =>
    renderToStaticMarkup(
      createElement(PausedSince, { userChain: undefined, pausedUntil }),
    );
  const html = renderUntil("2026-11-12T12:00:00Z");
  expect(html).toContain("Paused in all loops");
  expect(html).not.toContain("<time");
  expect(html).not.toContain("data-tip");
  expect(renderUntil("2026-10-20T12:00:00Z")).toBe("");
});

test("does not infer a start date for indefinite account pauses", () => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date("2026-11-20T12:00:00Z"));
  language.current = "nl";
  const html = renderToStaticMarkup(
    createElement(PausedSince, {
      userChain: { is_paused: false, paused_at: "2025-01-01" } as UserChain,
      pausedUntil: "2125-08-05T13:12:43Z",
    }),
  );
  expect(html).toContain("Paused in all loops");
  expect(html).not.toContain("<time");
  expect(html).not.toContain("data-tip");
  expect(html).not.toContain("2125");
});
test("hides expired account pauses even when a historical loop date remains", () => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date("2026-11-20T12:00:00Z"));
  expect(
    renderToStaticMarkup(
      createElement(PausedSince, {
        userChain: { is_paused: false, paused_at: "2025-01-01" } as UserChain,
        pausedUntil: "2026-11-09T14:49:00Z",
      }),
    ),
  ).toBe("");
});
