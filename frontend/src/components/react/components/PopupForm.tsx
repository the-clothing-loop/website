import { useEffect, useState } from "react";
import isSSR from "../util/is_ssr";
import { useTranslation } from "react-i18next";

const KEY = "2024-05-form";
const maxDate = new Date(2024, 6, 1);
const url = "https://yew6s2omgul.typeform.com/to/xoeaKKeu";

export default function PopupForm() {
  const { t } = useTranslation("survey");
  const [open, setOpen] = useState(false);
  useEffect(() => {
    if (isSSR()) return;

    const now = new Date();
    if (!window.localStorage.getItem(KEY) && maxDate > now) {
      setOpen(true);
    }
  });

  function close() {
    setOpen(false);
    window.localStorage.setItem(KEY, "closed");
  }
  function submit() {
    close();

    window.open(url, "_blank")!.focus();
  }

  return (
    <dialog
      className="fixed mx-auto md:me-0 mb-6 bottom-0 z-40 m-0 px-2 md:px-0 bg-transparent"
      // ref={refDisplay}
      // tabIndex={-1}
      // onClick={handleBackgroundClick}
      onCancel={close}
      open={open}
    >
      <div className="bg-white">
        <form className="bg-purple/10 border-2 max-w-screen-xs md:border-e-0 border-purple shadow-lg p-4 md:p-3">
          <h1 className="text-lg font-bold text-purple font-serif mb-2">
            {t("title")}
          </h1>
          <p className="text-sm">{t("body")}</p>
          <div className="flex flex-col md:flex-row justify-between md:justify-start gap-2 mt-4">
            <button
              type="button"
              className="btn md:btn-sm bg-purple text-white"
              onClick={submit}
            >
              {t("btnSubmit")}
            </button>
            <button
              type="button"
              className="btn md:btn-sm btn-ghost bg-white"
              onClick={close}
            >
              {t("close", { ns: "translation" })}
            </button>
          </div>
        </form>
      </div>
    </dialog>
  );
}
