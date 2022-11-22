import { useState, useRef, useEffect } from "react";

//project resources
import SingleCounter from "./SingleCounter";
import useIntersectionObserver from "./hooks";

import { useTranslation } from "react-i18next";
import { InfoBody, infoGet } from "../../api/info";
import { Link } from "react-router-dom";

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
    <div ref={containerRef} className="tw-grid tw-grid-cols-2">
      <div className="tw-stat">
        <div className="tw-mb-3 tw-stat-value tw-text-6xl tw-font-serif tw-text-stroke-base-100">
          {isVisible ? (
            <SingleCounter end={info?.total_chains || 0} step={2} />
          ) : (
            "0"
          )}
        </div>
        <div className="tw-stat-title">{t("Loops")}</div>
      </div>

      <div className="tw-stat">
        <div className="tw-mb-3 tw-stat-value tw-text-6xl tw-font-serif tw-text-stroke-base-100">
          {isVisible ? (
            <SingleCounter end={info?.total_users || 0} step={20} />
          ) : (
            "0"
          )}
        </div>
        <div className="tw-stat-title">{t("participants")}</div>
      </div>

      <div className="tw-stat">
        <div className="tw-mb-3 tw-stat-value tw-text-6xl tw-font-serif tw-text-stroke-base-100">
          6
        </div>
        <div className="tw-stat-title">{t("countries")}</div>
      </div>

      <div className="tw-stat">
        <div className="tw-mb-3 tw-stat-value tw-text-6xl tw-font-serif tw-text-stroke-base-100">
          <Link
            to="/loops/find"
            target="_blank"
            className="tw-btn tw-btn-primary tw-btn-circle"
          >
            <span className="feather feather-arrow-right" />
          </Link>
        </div>
        <div className="tw-stat-title tw-opacity-100">{t("ourGoals")}</div>
      </div>
    </div>
  );
}
