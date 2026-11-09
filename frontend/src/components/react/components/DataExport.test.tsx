import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import type { User } from "../../../api/types";
import { UserDataExport } from "./DataExport";

const captured = vi.hoisted(() => ({ props: {} as any }));
vi.mock("react-csv", () => ({
  CSVLink: (props: any) => {
    captured.props = props;
    return null;
  },
}));
vi.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

const users = ["paused", "routed"].map((uid) => ({
  uid,
  name: uid,
  address: "Street",
  email: "test@example.com",
  phone_number: "123",
  sizes: [],
  chains: [
    {
      chain_uid: "loop",
      is_paused: uid === "paused",
      paused_at: "2026-09-12T12:00:00Z",
    },
  ],
})) as unknown as User[];

describe("participant spreadsheet export", () => {
  it("includes paused participants outside the route and their pause date", () => {
    renderToStaticMarkup(
      <UserDataExport chainUID="loop" chainName="Loop" chainUsers={users} />,
    );
    expect(captured.props.headers).toContainEqual({
      label: "Paused since",
      key: "pausedSince",
    });
    expect(
      captured.props.data.map((row: any) => [row.name, row.pausedSince]),
    ).toEqual([
      ["paused", "2026-09-12"],
      ["routed", ""],
    ]);
  });
  it("preserves route selection and order for route exports", () => {
    renderToStaticMarkup(
      <UserDataExport
        chainUID="loop"
        chainName="Loop"
        chainUsers={users}
        route={["routed"]}
      />,
    );
    expect(captured.props.data.map((row: any) => row.name)).toEqual(["routed"]);
  });
});
