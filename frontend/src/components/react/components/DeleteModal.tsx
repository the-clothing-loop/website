import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useStore } from "@nanostores/react";

import type { Chain } from "../../../api/types";
import { $authUser } from "../../../stores/auth";
import { ReasonsForLeavingI18nKeys } from "../../../api/enums";

interface DeleteModalProps {
  onUpdateSelectedReasons: (selectedReasons: string[], other?: string) => void;
}

export default function DeleteModal({
  onUpdateSelectedReasons,
}: DeleteModalProps) {
  const { t, i18n } = useTranslation();
  const authUser = useStore($authUser);

  const [chains, setChains] = useState<Chain[]>([]);
  const [showOtherTextFieldArea, setShowOtherTextFieldArea] = useState(false);
  const [showMovedOptions, setShowMovedOptions] = useState(false);
  const [showNotEnoughItemsOptions, setShowNotEnoughItemsOptions] =
    useState(false);

  const [selectedReasons, setSelectedReasons] = useState<string[]>([]);
  const moved = Object.keys(ReasonsForLeavingI18nKeys)[0];
  const notEnoughItemsILiked = Object.keys(ReasonsForLeavingI18nKeys)[1];
  const primaryOptions = Object.keys(ReasonsForLeavingI18nKeys).slice(2, 6);
  const other = Object.keys(ReasonsForLeavingI18nKeys)[6];
  console.log(other);
  const movedOptions = Object.keys(ReasonsForLeavingI18nKeys).slice(7, 10);
  const notEnoughItemsOptions = Object.keys(ReasonsForLeavingI18nKeys).slice(
    10,
  );
  const [otherExplanation, setOtherExplanation] = useState("");

  function handleCheckboxChange(event: React.ChangeEvent<HTMLInputElement>) {
    const { name, checked } = event.target;
    const updatedReasons = checked
      ? [...selectedReasons, name]
      : selectedReasons.filter((reason) => reason !== name);

    setSelectedReasons(updatedReasons);
    onUpdateSelectedReasons(updatedReasons);
  }

  function showMovedOptionsHandler(event: React.ChangeEvent<HTMLInputElement>) {
    setShowMovedOptions(event.target.checked);
    handleCheckboxChange(event);
  }
  function showNotEnoughItemsOptionsHandler(
    event: React.ChangeEvent<HTMLInputElement>,
  ) {
    setShowNotEnoughItemsOptions(event.target.checked);
    handleCheckboxChange(event);
  }
  function showOtherTextFieldHandler(
    event: React.ChangeEvent<HTMLInputElement>,
  ) {
    setShowOtherTextFieldArea(event.target.checked);
    handleCheckboxChange(event);
  }
  function handleOtherTextChange(
    event: React.ChangeEvent<HTMLTextAreaElement>,
  ) {
    const updatedOther = event.target.value;
    setOtherExplanation(updatedOther);
    onUpdateSelectedReasons(selectedReasons, updatedOther);
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
          <li key={moved} className="flex items-center mb-4">
            <input
              type="checkbox"
              className="checkbox border-black"
              name={moved}
              id={moved}
              onChange={(e) => showMovedOptionsHandler(e)}
            />
            <label className="ml-2">
              {t(ReasonsForLeavingI18nKeys[moved])}
            </label>
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
                    onChange={(e) => handleCheckboxChange(e)}
                  />
                  <label className="ml-2">
                    {t(ReasonsForLeavingI18nKeys[r])}
                  </label>
                </li>
              ))}
            </>
          ) : null}

          <li key={notEnoughItemsILiked} className="flex items-center mb-4">
            <input
              type="checkbox"
              className="checkbox border-black"
              name={notEnoughItemsILiked}
              id={notEnoughItemsILiked}
              onChange={(e) => showNotEnoughItemsOptionsHandler(e)}
            />
            <label className="ml-2">
              {t(ReasonsForLeavingI18nKeys[notEnoughItemsILiked])}
            </label>
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
                    onChange={(e) => handleCheckboxChange(e)}
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
          <li key={other} className="flex items-center mb-4">
            <input
              type="checkbox"
              className="checkbox border-black"
              name={other}
              id={other}
              onChange={(e) => showOtherTextFieldHandler(e)}
            />
            <label className="ml-2">
              {t(ReasonsForLeavingI18nKeys[other])}
            </label>
          </li>
          {showOtherTextFieldArea ? (
            <>
              <li key="other_textarea" className="mx-7">
                <label className="text-sm">
                  Please let us know why you've decided to leave the Clothing
                  Loop and if there's anything we could do to improve.
                </label>
                <textarea
                  className="bg-grey-light w-full"
                  value={otherExplanation}
                  onChange={handleOtherTextChange}
                />
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
