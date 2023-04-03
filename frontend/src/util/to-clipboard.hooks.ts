import { TFunction } from "i18next";
import {
  useState,
  MouseEvent,
  SetStateAction,
  Dispatch,
  Attributes,
} from "react";

export default function useToClipboard(): [
  string,
  Dispatch<SetStateAction<string>>,
  (e: MouseEvent) => void,
  (t: TFunction, v: string, c?: string) => Attributes
] {
  const [copying, setCopying] = useState("");
  function handleToClipboard(e: MouseEvent) {
    e.preventDefault();

    let text = (e.target as any).innerText;

    setCopying(text);
    setTimeout(() => {
      setCopying("");
    }, 3000);

    navigator.clipboard.writeText(text);
  }

  function addCopyAttributes(
    t: TFunction,
    thisValue: string,
    moreClasses = ""
  ) {
    return {
      tabIndex: 1,
      className: `tooltip tooltip-top ${
        copying === thisValue ? "tooltip-open" : ""
      } ${moreClasses}`,
      onClick: handleToClipboard,
      "data-tip": copying === thisValue ? t("copiedToClipboard") : t("copy"),
    } as Attributes;
  }

  return [copying, setCopying, handleToClipboard, addCopyAttributes];
}
