import { useEffect } from "react";
import { addModal, closeModal, openModal } from "../../../stores/toast";

const SURVEY_MODAL_END_AT = Date.parse("2026-07-28T00:00:00+02:00");
const SURVEY_MODAL_SESSION_KEY = "survey-modal-2026-dismissed";
const SURVEY_MODAL_DELAY_MS = 1200;

const DUTCH_SURVEY_URL =
  "https://form.typeform.com/to/CJOqnnjY?typeform-source=9hxmp.r.sp1-brevo.net";
const ENGLISH_SURVEY_URL =
  "https://form.typeform.com/to/zRAK5BeX?typeform-source=9hxmp.r.sp1-brevo.net";

function dismissForSession() {
  try {
    sessionStorage.setItem(SURVEY_MODAL_SESSION_KEY, "true");
  } catch {
    // The modal can still be closed when browser storage is unavailable.
  }
}

function wasDismissedForSession() {
  try {
    return sessionStorage.getItem(SURVEY_MODAL_SESSION_KEY) === "true";
  } catch {
    return false;
  }
}

function SurveyModalContent() {
  return (
    <div className="space-y-5">
      <p>
        Vul onze korte enquête in en laat zien hoe jij bijdraagt aan het delen
        en hergebruiken van kleding. Het kost maar een paar minuten en helpt ons
        om Clothing Loop te verbeteren en verder te laten groeien.
      </p>
      <a
        className="btn btn-sm btn-primary w-full"
        href={DUTCH_SURVEY_URL}
        target="_blank"
        rel="noreferrer"
        onClick={closeModal}
      >
        Vul de enquête in
        <span className="icon-external-link ms-2" aria-hidden="true"></span>
      </a>

      <div className="border-t border-base-300 pt-5">
        <h5 className="text-lg mb-3">Help us shine a light on our impact!</h5>
        <p>
          Take our short survey and show how you give clothes a second life. It
          only takes a few minutes and helps us grow and improve.
        </p>
      </div>
      <a
        className="btn btn-sm btn-secondary w-full"
        href={ENGLISH_SURVEY_URL}
        target="_blank"
        rel="noreferrer"
        onClick={closeModal}
      >
        Take the survey
        <span className="icon-external-link ms-2" aria-hidden="true"></span>
      </a>
    </div>
  );
}

export default function SurveyModal() {
  useEffect(() => {
    if (Date.now() >= SURVEY_MODAL_END_AT || wasDismissedForSession()) return;

    const timeout = window.setTimeout(() => {
      if (openModal.get()) return;

      addModal({
        message: "Help ons onze impact zichtbaar maken!",
        content: SurveyModalContent,
        actions: [],
        onClose: dismissForSession,
      });
    }, SURVEY_MODAL_DELAY_MS);

    return () => window.clearTimeout(timeout);
  }, []);

  return null;
}
