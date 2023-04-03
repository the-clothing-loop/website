import { TFunction } from "i18next";
import { useState, MouseEvent, Attributes } from "react";

export default function useToClipboard(): (
  t: TFunction,
  v: string,
  c?: string
) => Attributes {
  const [copying, setCopying] = useState("");
  function handleToClipboard(e: MouseEvent, id: string) {
    e.preventDefault();

    let text = (e.target as any).innerText;

    setCopying(id);
    setTimeout(() => {
      setCopying("");
    }, 3000);

    navigator.clipboard.writeText(text);
  }

  function addCopyAttributes(t: TFunction, id: string, moreClasses = "") {
    return {
      id: { id },
      tabIndex: 1,
      className: `tooltip tooltip-top ${
        copying === id ? "tooltip-open" : ""
      } ${moreClasses}`,
      onClick: (e: MouseEvent) => handleToClipboard(e, id),
      "data-tip": copying === id ? t("copiedToClipboard") : t("copy"),
    } as Attributes;
  }

  return addCopyAttributes;
}
