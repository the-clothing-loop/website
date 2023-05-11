import { TextareaHTMLAttributes, useEffect, useState } from "react";

import tinymce, { Editor } from "tinymce/tinymce";
// DOM model
import "tinymce/models/dom/model";
// Theme
import "tinymce/themes/silver";
// Toolbar icons
import "tinymce/icons/default";
// Editor styles
import "tinymce/skins/ui/oxide/skin.min.css";

// importing the plugin js.
// if you use a plugin that is not listed here the editor will fail to load
import "tinymce/plugins/advlist";
import "tinymce/plugins/anchor";
import "tinymce/plugins/autolink";
import "tinymce/plugins/autoresize";
import "tinymce/plugins/autosave";
// import "tinymce/plugins/charmap";
import "tinymce/plugins/code";
// import "tinymce/plugins/codesample";
import "tinymce/plugins/directionality";
import "tinymce/plugins/emoticons";
// import "tinymce/plugins/fullscreen";
// import "tinymce/plugins/help";
import "tinymce/plugins/image";
// import "tinymce/plugins/importcss";
// import "tinymce/plugins/insertdatetime";
import "tinymce/plugins/link";
import "tinymce/plugins/lists";
import "tinymce/plugins/media";
import "tinymce/plugins/nonbreaking";
import "tinymce/plugins/pagebreak";
// import "tinymce/plugins/preview";
// import "tinymce/plugins/quickbars";
// import "tinymce/plugins/save";
import "tinymce/plugins/searchreplace";
import "tinymce/plugins/table";
// import "tinymce/plugins/typography";
// import "tinymce/plugins/template";
// import "tinymce/plugins/visualblocks";
// import "tinymce/plugins/visualchars";
import "tinymce/plugins/wordcount";

// importing plugin resources
import "tinymce/plugins/emoticons/js/emojis";

import "tinymce/skins/content/default/content.min.css";
import "tinymce/skins/ui/oxide/content.min.css";
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
  const [editor, setEditor] = useState<Editor | null>(null);

  useEffect(() => {
    tinymce.init({
      selector: "textarea#" + id,
      plugins: [
        "advlist",
        "anchor",
        "autolink",
        "directionality",
        "link",
        "image",
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
      toolbar: "bold italic bullist numlist emoticons", // link image",
      content_css: [],
      directionality: i18n.language === "he" ? "rtl" : "ltr",
    });

    let _editor = tinymce.get(id);

    _editor?.on("change", function (e) {
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

  return <textarea id={id} {...props} />;
}
