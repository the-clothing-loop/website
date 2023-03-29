import { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";

import SingleCounter from "./SingleCounter";
import useIntersectionObserver from "./hooks";
import { InfoBody, infoGet } from "../../api/info";

export default function Counters() {
  const { t } = useTranslation();
  const containerRef = useRef(null);

  const [info, setInfo] = useState<InfoBody>();

  useEffect(() => {
    infoGet().then((res) => setInfo(res.data));
  }, []);

  const isVisible = useIntersectionObserver(containerRef, {
    root: null,
    rootMargin: "50px",
    threshold: 0.5,
  });

  return (
    <div className="px-4">
      <div ref={containerRef} className="grid grid-cols-2 gap-3">
        <div className="">
          <div className="h-20 text-6xl font-serif text-stroke-base-100">
            {isVisible ? (
              <SingleCounter end={info?.total_chains || 0} step={193} />
            ) : (
              "0"
            )}
          </div>
          <div className="opacity-80">{t("Loops")}</div>
        </div>

        <div className="">
          <div className="h-20 text-6xl font-serif text-stroke-base-100">
            {isVisible ? (
              <SingleCounter end={info?.total_users || 0} step={193} />
            ) : (
              "0"
            )}
          </div>
          <div className="opacity-80">{t("participants")}</div>
        </div>

        <div className="">
          <div className="h-20 text-6xl font-serif text-stroke-base-100">
            12
          </div>
          <div className="opacity-80">{t("countries")}</div>
        </div>

        <div className="">
          <div className="h-20 text-6xl font-serif text-stroke-base-100 flex items-center">
            <a
              href="https://heyzine.com/flip-book/0c17a4fe2a.html"
              target="_blank"
              rel="noreferrer"
              className="btn btn-primary btn-circle"
              aria-label="our impact"
            >
              <span className="feather feather-arrow-right" />
            </a>
          </div>
          <div className="opacity-100 whitespace-normal">
            {t("readOurImpactReport")}
          </div>
        </div>
      </div>
    </div>
  );
}
