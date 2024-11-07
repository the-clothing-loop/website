import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useStore } from "@nanostores/react";

import type { Chain } from "../../../api/types";
import { $authUser } from "../../../stores/auth";
import {
  ReasonsForLeaving,
  ReasonsForLeavingI18nKeys,
} from "../../../api/enums";

export default function DeleteModal() {
  const { t, i18n } = useTranslation();
  const authUser = useStore($authUser);
  const [chains, setChains] = useState<Chain[]>([]);
  const [showOtherTextFieldArea, setShowOtherTextFieldArea] = useState(false);
  const [showMovedOptions, setShowMovedOptions] = useState(false);
  const [showNotEnoughItemsOptions, setShowNotEnoughItemsOptions] =
    useState(false);

  const [selectedReasons, setSelectedReasons] = useState<string[]>([]);

  const primaryOptions = Object.keys(ReasonsForLeavingI18nKeys).slice(2, 6);
  const movedOptions = Object.keys(ReasonsForLeavingI18nKeys).slice(6, 9);
  const notEnoughItemsOptions = Object.keys(ReasonsForLeavingI18nKeys).slice(9);

  primaryOptions.map((r: string) => {
    console.log(t(ReasonsForLeavingI18nKeys[r]));
  });
  movedOptions.map((r: string) => {
    console.log(t(ReasonsForLeavingI18nKeys[r]));
  });
  notEnoughItemsOptions.map((r: string) => {
    console.log(t(ReasonsForLeavingI18nKeys[r]));
  });
  const handleCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = event.target;

    if (checked) {
      setSelectedReasons((prev) => [
        ...prev,
        ReasonsForLeaving[name as keyof typeof ReasonsForLeaving],
      ]);
    } else {
      setSelectedReasons((prev) =>
        prev.filter(
          (reason) =>
            reason !==
            ReasonsForLeaving[name as keyof typeof ReasonsForLeaving],
        ),
      );
    }
  };
  function showOtherTextFieldHandler(
    event: React.ChangeEvent<HTMLInputElement>,
  ) {
    setShowOtherTextFieldArea(event.target.checked);
  }
  function showMovedOptionsHandler(event: React.ChangeEvent<HTMLInputElement>) {
    setShowMovedOptions(event.target.checked);
  }
  function showNotEnoughItemsOptionsHandler(
    event: React.ChangeEvent<HTMLInputElement>,
  ) {
    setShowNotEnoughItemsOptions(event.target.checked);
  }
  if (!authUser) return;
  const chainNames = authUser.is_root_admin
    ? undefined
    : (authUser.chains
        .filter((uc) => uc.is_chain_admin)
        .map((uc) => chains.find((c) => c.uid === uc.chain_uid))
        .filter((c) => c && c.total_hosts && !(c.total_hosts > 1))
        .map((c) => c!.name) as string[]);

  if (!(chainNames && chainNames.length))
    return (
      <div className="space-y-2">
        <p>Please select a reason for leaving</p>

        <ul className="list-none">
          <li key="moved" className="flex items-center mb-4">
            <input
              type="checkbox"
              className="checkbox border-black"
              name={"moved"}
              onChange={(e) => showMovedOptionsHandler(e)}
            />
            <label className="ml-2">{t("moved")}</label>
          </li>

          {showMovedOptions ? (
            <>
              {movedOptions.map((r) => (
                <li key={r} className="flex items-center mb-4 ml-8">
                  <input
                    type="checkbox"
                    className="checkbox border-black"
                    name={r}
                    id={r}
                  />
                  <label className="ml-2">
                    {t(ReasonsForLeavingI18nKeys[r])}
                  </label>
                </li>
              ))}
            </>
          ) : null}

          <li key="notEnoughItemsILiked" className="flex items-center mb-4">
            <input
              type="checkbox"
              className="checkbox border-black"
              name={"notEnoughItemsILiked"}
              onChange={(e) => showNotEnoughItemsOptionsHandler(e)}
            />
            <label className="ml-2">{t("notEnoughItemsILiked")}</label>
          </li>

          {showNotEnoughItemsOptions ? (
            <>
              {notEnoughItemsOptions.map((r) => (
                <li key={r} className="flex items-center mb-4 ml-8">
                  <input
                    type="checkbox"
                    className="checkbox border-black"
                    name={r}
                    id={r}
                  />
                  <label className="ml-2">
                    {t(ReasonsForLeavingI18nKeys[r])}
                  </label>
                </li>
              ))}
            </>
          ) : null}
          {primaryOptions.map((r: string) => (
            <li key={r} className="flex items-center mb-4">
              <input
                type="checkbox"
                className="checkbox border-black"
                name={r}
                id={r}
                onChange={(e) => handleCheckboxChange(e)}
              />
              <label className="ml-2">{t(ReasonsForLeavingI18nKeys[r])}</label>
            </li>
          ))}
          <li key="other" className="flex items-center mb-4">
            <input
              type="checkbox"
              className="checkbox border-black"
              name={"other"}
              onChange={(e) => showOtherTextFieldHandler(e)}
            />
            <label className="ml-2">{t("other")}</label>
          </li>
          {showOtherTextFieldArea ? (
            <>
              <li key="other_text" className="mx-7">
                <label className="text-sm">
                  Please let us know why you've decided to leave the Clothing
                  Loop and if there's anything we could do to improve.
                </label>
                <textarea className="bg-grey-light w-full" />
              </li>
            </>
          ) : null}
        </ul>
      </div>
    );
  return (
    <div className="space-y-2">
      <p className="">{t("deleteAccountWithLoops")}</p>
      <ul
        className={`text-sm font-semibold mx-8 ${
          chainNames.length > 1 ? "list-disc" : "list-none text-center"
        }`}
      >
        {chainNames.map((name) => (
          <li key={name}>{name}</li>
        ))}
      </ul>
    </div>
  );
}
