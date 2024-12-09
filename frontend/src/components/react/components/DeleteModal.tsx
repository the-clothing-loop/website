import { useState, type FormEvent, type InputHTMLAttributes } from "react";
import { useTranslation } from "react-i18next";
import {
  ReasonsForLeaving,
  ReasonsForLeavingI18nKeys,
} from "../../../api/enums";
import { addToastError } from "../../../stores/toast";

interface DeleteModalProps {
  onSubmitReasonForLeaving: (
    selectedReasons: string[],
    other: string | undefined,
  ) => Promise<void>;
  isOpen: boolean;
  onClose: () => void;
  chainNames: string[];
}

const NAME_PREFIX = "delete-";

const PRIMARY_OPTIONS = [
  ReasonsForLeaving.addressTooFar,
  ReasonsForLeaving.tooTimeConsuming,
  ReasonsForLeaving.doneSwapping,
  ReasonsForLeaving.didntFitIn,
];

const FILTER_MOVED_OPTIONS = [
  ReasonsForLeaving.planToJoinNewLoop,
  ReasonsForLeaving.planToStartNewLoop,
  ReasonsForLeaving.dontPlanToParticipate,
];

const FILTER_NOT_ENOUGH_ITEMS_OPTIONS = [
  ReasonsForLeaving.qualityDidntMatch,
  ReasonsForLeaving.sizesDidntMatch,
  ReasonsForLeaving.stylesDidntMatch,
];

export default function DeleteModal({
  onSubmitReasonForLeaving,
  isOpen,
  onClose,
  chainNames,
}: DeleteModalProps) {
  const { t } = useTranslation();
  const [showOtherTextFieldArea, setShowOtherTextFieldArea] = useState(false);
  const [showMovedOptions, setShowMovedOptions] = useState(false);
  const [showNotEnoughItemsOptions, setShowNotEnoughItemsOptions] =
    useState(false);

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    let selectedReasons: string[] = [];
    for (let n in Object.keys(ReasonsForLeavingI18nKeys)) {
      //@ts-expect-error e.target should be a form element with the name of each checkbox as a index
      const elCheckbox = e.target[NAME_PREFIX + n] as
        | null
        | undefined
        | HTMLInputElement;
      if (!elCheckbox) continue;
      if (elCheckbox.checked) {
        selectedReasons.push(n);
      }
    }

    const otherExplanation: string | undefined =
      //@ts-expect-error
      (e.target["other_explanation"]?.value as string | undefined) || undefined;

    if (selectedReasons.length == 0) {
      addToastError(t("selectReasonForLeaving"));
    } else {
      console.info(
        "Submit selectReasonForLeaving:",
        selectedReasons.map((r) => ReasonsForLeavingI18nKeys[r]).join(", "),
      );
      onSubmitReasonForLeaving(selectedReasons, otherExplanation).then(() => {
        setShowMovedOptions(false);
        setShowNotEnoughItemsOptions(false);
        setShowOtherTextFieldArea(false);

        //@ts-expect-error Missing react dom types
        e.target.reset();
        onClose();
      });
    }
  }

  return (
    <dialog
      tabIndex={-1}
      className="fixed overflow-visible inset-0 z-50 justify-center items-center p-0 shadow-lg backdrop:bg-white/30"
      open={isOpen}
    >
      <form className="bg-white max-w-screen-sm px-6" onSubmit={onSubmit}>
        <h5 className="text-lg my-6 min-w-[300px]">{t("deleteAccount")}</h5>
        {chainNames && chainNames.length ? (
          <div>
            <h5 className="text-md my-6">{t("deleteAccountWithLoops")}</h5>
            <ul
              className={`text-sm font-semibold mx-6 ${
                chainNames.length > 1 ? "list-disc" : "list-none text-center"
              }`}
            >
              {chainNames.map((name) => (
                <li key={name}>{name}</li>
              ))}
            </ul>
            <button
              onClick={onClose}
              key="close"
              type="reset"
              className={"btn btn-sm btn-ghost float-end my-6"}
            >
              {t("close")}
            </button>
          </div>
        ) : (
          <div>
            <h5 className="text-md my-6">{t("selectReasonForLeaving")}</h5>
            <ul className="list-none">
              <li key={ReasonsForLeaving.moved} className="mb-4">
                <InputCheckbox
                  label={t(ReasonsForLeavingI18nKeys[ReasonsForLeaving.moved])}
                  name={ReasonsForLeaving.moved}
                  checked={showMovedOptions}
                  onChange={(e) => setShowMovedOptions(e.target.checked)}
                />
              </li>

              {showMovedOptions ? (
                <>
                  {FILTER_MOVED_OPTIONS.map((r) => (
                    <li key={r} className="mb-4 ml-8">
                      <InputCheckbox
                        label={t(ReasonsForLeavingI18nKeys[r])}
                        name={r}
                      />
                    </li>
                  ))}
                </>
              ) : null}

              <li key={ReasonsForLeaving.notEnoughItemsILiked} className="mb-4">
                <InputCheckbox
                  label={t(
                    ReasonsForLeavingI18nKeys[
                      ReasonsForLeaving.notEnoughItemsILiked
                    ],
                  )}
                  name={ReasonsForLeaving.notEnoughItemsILiked}
                  checked={showNotEnoughItemsOptions}
                  onChange={(e) =>
                    setShowNotEnoughItemsOptions(e.target.checked)
                  }
                />
              </li>

              {showNotEnoughItemsOptions ? (
                <>
                  {FILTER_NOT_ENOUGH_ITEMS_OPTIONS.map((r) => (
                    <li key={r} className="mb-4 ml-8">
                      <InputCheckbox
                        label={t(ReasonsForLeavingI18nKeys[r])}
                        name={r}
                      />
                    </li>
                  ))}
                </>
              ) : null}
              {PRIMARY_OPTIONS.map((r) => (
                <li key={r} className="mb-4">
                  <InputCheckbox
                    label={t(ReasonsForLeavingI18nKeys[r])}
                    name={r}
                  />
                </li>
              ))}
              <li key="other" className="mb-4">
                <InputCheckbox
                  label={t(ReasonsForLeavingI18nKeys[ReasonsForLeaving.other])}
                  name={ReasonsForLeaving.other}
                  checked={showOtherTextFieldArea}
                  onChange={(e) => setShowOtherTextFieldArea(e.target.checked)}
                />

                {showOtherTextFieldArea ? (
                  <div className="mx-7">
                    <label className="text-sm">
                      <p className="my-2">{t("leaveFeedback")}</p>
                      <textarea
                        name="other_explanation"
                        className="textarea bg-grey-light w-full"
                        required
                        minLength={5}
                      />
                    </label>
                  </div>
                ) : null}
              </li>
            </ul>
            <div className="flex justify-between my-6">
              <button type="submit" className="btn btn-sm btn-error">
                {t("delete")}
              </button>
              <button
                onClick={onClose}
                type="reset"
                className={"btn btn-sm btn-ghost"}
              >
                {t("cancel")}
              </button>
            </div>
          </div>
        )}
      </form>
    </dialog>
  );
}

function InputCheckbox({
  name,
  label,
  ...props
}: {
  name: ReasonsForLeaving;
  label: string;
} & Omit<InputHTMLAttributes<HTMLInputElement>, "name">) {
  return (
    <label className="flex gap-2">
      <input
        name={NAME_PREFIX + name}
        type="checkbox"
        className="checkbox border-black"
        {...props}
      />
      <span>{label}</span>
    </label>
  );
}
