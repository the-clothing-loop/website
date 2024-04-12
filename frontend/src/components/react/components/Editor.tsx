import { useRef } from "react";
import useHydrated from "../util/hydrated.hooks";

import pell from "pell";
import "pell/dist/pell.css";

interface Props {
  onChange: (value: string) => void;
  value: string;
}
export default function ({ onChange, value }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useHydrated(() => {
    const _editor = pell.init({
      element: ref.current!,
      onChange,
      defaultParagraphSeparator: "p",
      styleWithCSS: false,
      actions: [
        "bold",
        "italic",
        "underline",
        "olist",
        "ulist",
        "link",
        "image",
      ],
      classes: {
        actionbar: "pell-actionbar",
        button: "pell-button",
        content: "pell-content prose bg-white",
        selected: "pell-button-selected",
      },
    });
    _editor.content.innerHTML = value;
  });

  return <div ref={ref} />;
}
