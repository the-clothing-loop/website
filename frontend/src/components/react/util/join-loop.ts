import type { TFunction } from "i18next";
import type { Chain, User } from "../../../api/types";
import { CatI18nKeys, type Categories } from "../../../api/enums";
import { chainAddUser } from "../../../api/chain";
import { userUpdate } from "../../../api/user";
import { $authUser, authUserRefresh } from "../../../stores/auth";
import { addModal, addToastError } from "../../../stores/toast";
import categories from "./categories";
import { GinParseErrors } from "./gin-errors";

export function missingLoopInterests(chain: Chain, user: User) {
  const missingCategories = [...new Set(chain.genders)].filter((category) => {
    const sizes = categories[category as Categories] || [];
    return sizes.length > 0 && !sizes.some((size) => user.sizes.includes(size));
  });
  const sizes = missingCategories.flatMap((category) => {
    const categorySizes = categories[category as Categories];
    const loopSizes = categorySizes.filter((size) =>
      chain.sizes.includes(size),
    );
    return loopSizes.length ? loopSizes : categorySizes;
  });
  return { categories: missingCategories, sizes };
}

export function requestJoinLoop({
  chain,
  user,
  t,
  confirm = false,
  onJoined,
}: {
  chain: Chain;
  user: User;
  t: TFunction;
  confirm?: boolean;
  onJoined?: () => void;
}) {
  const missing = missingLoopInterests(chain, user);
  let joining = false;

  async function join(addInterests: boolean) {
    if (joining) return;
    joining = true;
    try {
      if (addInterests) {
        const currentUser = $authUser.get();
        const sizes = [
          ...new Set([
            ...(currentUser?.uid === user.uid ? currentUser.sizes : user.sizes),
            ...missing.sizes,
          ]),
        ];
        await userUpdate({ user_uid: user.uid, sizes });
        if (currentUser?.uid === user.uid)
          $authUser.set({ ...currentUser, sizes });
      }
      await chainAddUser(chain.uid, user.uid, false);
      await authUserRefresh(true);
      onJoined?.();
    } catch (err: any) {
      addToastError(GinParseErrors(t, err), err?.status);
    } finally {
      joining = false;
    }
  }

  if (missing.categories.length) {
    addModal({
      message: t("addLoopCategoryToInterests", {
        defaultValue:
          "“{{chainName}}” includes {{categories}}, which are not in your interested sizes. Would you like to add this category’s sizes to your account before joining?",
        chainName: chain.name,
        categories: missing.categories
          .map((category) => t(CatI18nKeys[category]))
          .join(", "),
        interpolation: { escapeValue: false },
      }),
      actions: [
        {
          text: t("addInterestsAndJoin", {
            defaultValue: "Add to my interests and join",
          }),
          type: "primary",
          fn: () => {
            void join(true);
          },
        },
        {
          text: t("joinWithoutAddingInterests", {
            defaultValue: "Join without adding",
          }),
          type: "secondary",
          fn: () => {
            void join(false);
          },
        },
      ],
    });
  } else if (confirm) {
    addModal({
      message: t("AreYouSureJoinLoop", {
        chainName: chain.name,
        interpolation: { escapeValue: false },
      }),
      actions: [
        {
          text: t("join"),
          type: "secondary",
          fn: () => {
            void join(false);
          },
        },
      ],
    });
  } else {
    void join(false);
  }
}
