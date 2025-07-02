import { type FormEvent, useState } from "react";

import { contactNewsletterSet, newsletterUpload } from "../../../api/contact";
import FormJup from "../util/form-jup";
import { GinParseErrors } from "../util/gin-errors";
import { useTranslation } from "react-i18next";
import { addToastError } from "../../../stores/toast";
import { $authUser } from "../../../stores/auth";
import { useStore } from "@nanostores/react";
import { useRef } from "react";

interface FormValues {
  name: string;
  email: string;
}

export const Newsletter = () => {
  const { t } = useTranslation();

  const [submitted, setSubmitted] = useState(false);
  const [isError, setIsError] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const authUser = useStore($authUser);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const values = FormJup<FormValues>(e);
    (async () => {
      try {
        await contactNewsletterSet(values.name, values.email, true);
      } catch (err: any) {
        console.error("Unable to set newsletter", err, values.email);
        addToastError(GinParseErrors(t, err), err?.status);

        setIsError(true);
        setTimeout(() => setIsError(false), 3000);

        return;
      }

      setSubmitted(true);
    })();
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      addToastError("File too large (max 5MB)", 400);
      return;
    }

    if (file.type !== 'application/pdf') {
      addToastError("Only PDF files are allowed", 400);
      return;
    }

    setSelectedFile(file);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    try {
      const response = await newsletterUpload(selectedFile);

      addToastError("Newsletter uploaded successfully");
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Upload error:', error);
      addToastError("Upload failed");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <form
      onSubmit={onSubmit}
      className="bg-teal-light lg:w-1/2 p-6 sm:p-10 lg:py-14 lg:px-16 lg:min-h-[456px]"
    >
      {submitted ? (
        <div className="max-w-[600px] mx-auto lg:mx-0">
          <p className="font-serif text-secondary font-bold text-5xl mb-4 leading-snug">
            {t("thankYouForSigningUp")}
          </p>
          <p>{t("youAreNowSubscribedToOurMonthlyNewsletter")}</p>
        </div>
      ) : isError ? (
        <div className="max-w-[600px] mx-auto lg:mx-0">
          <p className="font-serif text-secondary font-bold text-5xl mb-4 leading-snug">
            {t("somethingIsWrong")}
          </p>
          <p>{t("pleaseTryAgainInSeconds")}</p>
        </div>
      ) : (
        <div className="flex flex-col sm:flex-row lg:flex-col max-w-screen-md mx-auto">
          <div className="w-full sm:w-1/2 md:w-2/3 lg:w-full sm:pe-8">
            <h2 className="font-serif text-secondary font-bold text-5xl mb-4 leading-snug">
              {t("keepUpWithOurLatestNews")}
            </h2>
            <p className="mb-8 sm:mb-0 lg:mb-8">
              {t("subscribeToRecieveOurLatestNews")}
            </p>
          </div>

          <div className="w-full sm:w-1/2 md:w-1/3 lg:w-full flex flex-col sm:pl-4 md:pl-0 justify-center">
            <div className="flex flex-col lg:flex-row lg:max-w-screen-xs">
              <label className="form-control mb-5 lg:me-5" aria-label="name">
                <input
                  type="text"
                  name="name"
                  className="input input-bordered w-full input-secondary"
                  placeholder={t("name")!}
                  min={3}
                  required
                />
              </label>
              <label className="form-control mb-5" aria-label="email">
                <input
                  type="email"
                  name="email"
                  placeholder={t("emailAddress")!}
                  className="input input-bordered w-full input-secondary"
                  required
                />
              </label>
            </div>
            <div className="inline-flex gap-5">
              <button
                className="btn btn-primary w-full sm:w-auto"
                type="submit"
              >
                {t("submit")}
                <span className="icon-arrow-right ml-3 rtl:hidden"></span>
                <span className="icon-arrow-left mr-3 ltr:hidden"></span>
              </button>
              {authUser?.is_root_admin ? (
                <>
                <label className="form-control w-full max-w-xs">
                  <input 
                    type="file" 
                    className="file-input file-input-bordered w-full max-w-xs" 
                    onChange={handleFileChange}
                    ref={fileInputRef}
                    accept=".pdf"
                  />
                  <div className="label">
                    <span className="label-text">
                      {selectedFile ? selectedFile.name : "Upload Latest Newsletter"}
                    </span>
                  </div>
                </label>
                {selectedFile && (
                  <button
                    className="btn btn-primary w-full sm:w-auto"
                    type="button"
                    onClick={handleUpload}
                    disabled={isUploading}
                  >
                    {isUploading ? "Uploading..." : "Upload"}
                  </button>
                )}
                </>
              ) : (
                <button
                  className="btn btn-ghost w-full sm:w-auto"
                  type="button"
                  onClick={() => window.open("/newsletter.pdf", "_blank")} //placeholder for newsletter URL, update once backend is ready
                >
                  {t("downloadNewsletter")}
                  <span className="icon-download ml-3"></span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </form>
  );
};
