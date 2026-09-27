import { beforeEach, expect, test, vi } from "vitest";
import type { TFunction } from "i18next";
import type { Chain, User } from "../../../api/types";
import { Categories, Sizes } from "../../../api/enums";
import { chainAddUser } from "../../../api/chain";
import { userUpdate } from "../../../api/user";
import { $authUser, authUserRefresh } from "../../../stores/auth";
import { addModal, addToastError, type Modal } from "../../../stores/toast";
import { missingLoopInterests, requestJoinLoop } from "./join-loop";
vi.mock("../../../api/chain", () => ({ chainAddUser: vi.fn() }));
vi.mock("../../../api/user", () => ({ userUpdate: vi.fn() }));
vi.mock("../../../stores/auth", () => ({
  $authUser: { get: vi.fn(), set: vi.fn() },
  authUserRefresh: vi.fn(),
}));
vi.mock("../../../stores/toast", () => ({
  addModal: vi.fn(),
  addToastError: vi.fn(),
}));
const user = { uid: "user", sizes: [Sizes.womenSmall] } as User;
const chain = {
  uid: "loop",
  name: "Men's loop",
  genders: [Categories.men],
  sizes: [Sizes.menMedium],
} as Chain;
const t = ((key: string) => key) as TFunction;
const modal = () => vi.mocked(addModal).mock.calls[0][0] as Modal;
beforeEach(() => {
  vi.resetAllMocks();
  vi.mocked($authUser.get).mockReturnValue(user);
});
test("detects absent categories and adds only their loop sizes", () => {
  expect(missingLoopInterests(chain, user)).toEqual({
    categories: [Categories.men],
    sizes: [Sizes.menMedium],
  });
});
test("does not prompt for a represented category even if specific sizes differ", () => {
  expect(
    missingLoopInterests(
      { ...chain, genders: [Categories.women], sizes: [Sizes.womenLarge] },
      user,
    ).categories,
  ).toEqual([]);
});
test("ignores books and toys because they have no account sizes", () => {
  expect(
    missingLoopInterests(
      { ...chain, genders: [Categories.books, Categories.toys], sizes: [] },
      user,
    ).categories,
  ).toEqual([]);
});
test("uses category sizes when the loop has no size restriction", () => {
  expect(missingLoopInterests({ ...chain, sizes: [] }, user).sizes).toEqual([
    Sizes.menSmall,
    Sizes.menMedium,
    Sizes.menLarge,
    Sizes.menPlusSize,
  ]);
});
test("waits for consent, then preserves interests and saves before joining", async () => {
  const onJoined = vi.fn();
  requestJoinLoop({ chain, user, t, onJoined });
  expect(userUpdate).not.toHaveBeenCalled();
  expect(chainAddUser).not.toHaveBeenCalled();
  modal().actions[0].fn(undefined);
  await vi.waitFor(() => expect(onJoined).toHaveBeenCalledOnce());
  expect(userUpdate).toHaveBeenCalledWith({
    user_uid: user.uid,
    sizes: [Sizes.womenSmall, Sizes.menMedium],
  });
  expect(chainAddUser).toHaveBeenCalledWith(chain.uid, user.uid, false);
  expect(vi.mocked(userUpdate).mock.invocationCallOrder[0]).toBeLessThan(
    vi.mocked(chainAddUser).mock.invocationCallOrder[0],
  );
  expect(authUserRefresh).toHaveBeenCalledWith(true);
});
test("declining the interest addition still joins without changing the profile", async () => {
  requestJoinLoop({ chain, user, t });
  modal().actions[1].fn(undefined);
  await vi.waitFor(() => expect(chainAddUser).toHaveBeenCalledOnce());
  expect(userUpdate).not.toHaveBeenCalled();
});
test("a failed profile save reports an error and does not join", async () => {
  vi.mocked(userUpdate).mockRejectedValue({
    status: 500,
    data: "Could not save",
  });
  requestJoinLoop({ chain, user, t });
  modal().actions[0].fn(undefined);
  await vi.waitFor(() => expect(addToastError).toHaveBeenCalled());
  expect(chainAddUser).not.toHaveBeenCalled();
});
test("matching categories keep the map join confirmation", () => {
  requestJoinLoop({
    chain,
    user: { ...user, sizes: [Sizes.menSmall] },
    t,
    confirm: true,
  });
  expect(modal().message).toBe("AreYouSureJoinLoop");
  expect(userUpdate).not.toHaveBeenCalled();
  expect(chainAddUser).not.toHaveBeenCalled();
});

test("a mixed-category loop adds only the category not already represented", () => {
  expect(
    missingLoopInterests(
      {
        ...chain,
        genders: [Categories.women, Categories.men],
        sizes: [Sizes.womenLarge, Sizes.menMedium],
      },
      user,
    ),
  ).toEqual({ categories: [Categories.men], sizes: [Sizes.menMedium] });
});

test("a matching signup joins directly without a popup or profile update", async () => {
  requestJoinLoop({ chain, user: { ...user, sizes: [Sizes.menSmall] }, t });
  await vi.waitFor(() => expect(chainAddUser).toHaveBeenCalledOnce());
  expect(addModal).not.toHaveBeenCalled();
  expect(userUpdate).not.toHaveBeenCalled();
});
