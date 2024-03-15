import { type TextareaHTMLAttributes, useEffect, useState } from "react";
import tinymce, { type IEditor } from "../util/tinymce";
import { useTranslation } from "react-i18next";

type Props = Omit<
  TextareaHTMLAttributes<HTMLTextAreaElement>,
  "id" | "onChange"
> & {
  onChange: (value: string) => void;
};
export function TinyMCE({ onChange, ...props }: Props) {
  const { i18n } = useTranslation();
  const [id] = useState(() => "mce-" + window.crypto.randomUUID());
  const [editor, setEditor] = useState<IEditor | null>(null);

  useEffect(() => {
    tinymce.init({
      selector: "textarea#" + id,
      plugins: [
        "advlist",
        "directionality",
        "link",
        "autolink",
        "lists",
        "charmap",
        "pagebreak",
        "searchreplace",
        "wordcount",
        "media",
        "table",
        "typography",
        "emoticons",
      ],
      menubar: false,
      toolbar: "bold italic bullist numlist emoticons", // image",
      content_css: [],
      directionality: i18n.language === "he" ? "rtl" : "ltr",
      link_quicklink: true,
      link_default_target: "_blank",
      contextmenu: [],
      browser_spellcheck: true,
    });

    let _editor = tinymce.get(id);

    _editor?.on("change", function () {
      const html = _editor?.getContent({ format: "html" }) as string;
      onChange(html);
    });

    setEditor(_editor);

    return () => _editor?.remove();
  }, []);

  useEffect(() => {
    if (i18n.language === "he") {
      editor?.execCommand("mceDirectionRTL");
    } else {
      editor?.execCommand("mceDirectionLTR");
    }
  }, [i18n.language]);

  return <textarea id={id} {...props} spellCheck />;
}
