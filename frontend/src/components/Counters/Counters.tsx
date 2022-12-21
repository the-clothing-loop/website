import { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";

import SingleCounter from "./SingleCounter";
import useIntersectionObserver from "./hooks";
import { InfoBody, infoGet } from "../../api/info";

export default function Counters() {
  const { t } = useTranslation();
  const containerRef = useRef(null);

  const [info, setInfo] = useState<InfoBody>();

  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    infoGet().then((res) => setInfo(res.data));
  }, []);

  //check if div is visible on viewport
  const callBack = (entries: any) => {
    const [entry] = entries;
    setIsVisible(entry.isIntersecting);
  };

  useIntersectionObserver(callBack, containerRef, {
    root: null,
    rootMargin: "50px",
    threshold: 0.5,
  });

  return (
    <div ref={containerRef} className="grid grid-cols-2">
      <div className="stat">
        <div className="mb-3 stat-value text-6xl font-serif text-stroke-base-100">
          {isVisible ? (
            <SingleCounter end={info?.total_chains || 0} step={2} />
          ) : (
            "0"
          )}
        </div>
        <div className="stat-title">{t("Loops")}</div>
      </div>

      <div className="stat">
        <div className="mb-3 stat-value text-6xl font-serif text-stroke-base-100">
          {isVisible ? (
            <SingleCounter end={info?.total_users || 0} step={20} />
          ) : (
            "0"
          )}
        </div>
        <div className="stat-title">{t("participants")}</div>
      </div>

      <div className="stat">
        <div className="mb-3 stat-value text-6xl font-serif text-stroke-base-100">
          6
        </div>
        <div className="stat-title">{t("countries")}</div>
      </div>

      <div className="stat">
        <div className="mb-3 stat-value text-6xl font-serif text-stroke-base-100">
          <a
            href="https://heyzine.com/flip-book/0c17a4fe2a.html"
            target="_blank"
            rel="noreferrer"
            className="btn btn-primary btn-circle"
          >
            <span className="feather feather-arrow-right" />
          </a>
        </div>
        <div className="stat-title opacity-100">{t("readOurImpactReport")}</div>
      </div>
    </div>
  );
}
