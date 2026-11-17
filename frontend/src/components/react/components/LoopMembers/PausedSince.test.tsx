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
      key === "nDays" ? `${options?.count} days` : "Paused since",
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
  expect(html).toContain(">12-09-26</time>");
  expect(html).toContain('data-tip="39 days"');
  expect(html).toContain("focus:tooltip-open");
  language.current = "en";
  expect(render()).toContain(">09/12/26</time>");
});

test("leaves active participants and unknown start dates blank", () => {
  expect(render({ is_paused: false })).toBe("");
  expect(render({ paused_at: undefined })).toBe("");
  expect(render({ paused_at: null })).toBe("");
  expect(render({ paused_at: "invalid" })).toBe("");
});

test("shows an overall pause end date without inventing a start date", () => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date("2026-10-21T12:00:00Z"));
  language.current = "nl";
  const renderUntil = (pausedUntil: string) =>
    renderToStaticMarkup(
      createElement(PausedSince, { userChain: undefined, pausedUntil }),
    );
  const html = renderUntil("2026-11-12T12:00:00Z");
  expect(html).toContain(">12-11-26</time>");
  expect(html).not.toContain("data-tip");
  expect(renderUntil("2026-10-20T12:00:00Z")).toBe("");
});
