import { useState, useRef, useEffect } from "react";

import SingleCounter from "./SingleCounter";
import useIntersectionObserver from "./hooks";
import { type InfoBody, infoGet } from "../../../../api/info";
import { useTranslation } from "react-i18next";

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

  if (!info) return null;

  return (
    <div className="px-4">
      <div ref={containerRef} className="grid grid-cols-2 gap-3">
        <div>
          <div className="h-20 text-6xl font-serif text-stroke-base-100">
            {isVisible ? (
              <SingleCounter end={info?.total_chains || 0} step={193} />
            ) : (
              "0"
            )}
          </div>
          <div className="opacity-80">{t("Loops")}</div>
        </div>

        <div>
          <div className="h-20 text-6xl font-serif text-stroke-base-100">
            {isVisible ? (
              <SingleCounter end={info?.total_users || 0} step={397} />
            ) : (
              "0"
            )}
          </div>
          <div className="opacity-80">{t("addresses")}</div>
        </div>

        <div>
          <div className="h-20 text-5xl font-serif text-stroke-base-100">
            {isVisible ? (
              <SingleCounter end={info ? info.total_users * 2 : 0} step={397} />
            ) : (
              "0"
            )}
          </div>
          <div className="opacity-80">{t("participants")}</div>
        </div>
        <div>
          <div className="h-20 text-6xl font-serif text-stroke-base-100">
            {isVisible ? (
              <SingleCounter end={info?.total_countries || 0} step={1} />
            ) : (
              "0"
            )}
          </div>
          <div className="opacity-80">{t("countries")}</div>
        </div>

        <div className="col-span-2 xl:col-span-1">
          <div className="h-20 text-4xl font-serif flex items-center">
            <span>
              <span className="text-stroke-base-100 tracking-wide">
                {isVisible ? <SingleCounter end={1197375} step={9000} /> : "0"}
              </span>

              <span className="text-lg ms-1">&nbsp;{t("nCo2")}</span>
            </span>
          </div>
          <div className="opacity-80">{t("co2EmissionAvoided")}</div>
        </div>

        <div className="col-span-2 xl:col-span-1">
          <div className="h-20 text-4xl font-serif flex items-center">
            <span>
              <span className="text-stroke-base-100 tracking-wide">
                {isVisible ? (
                  <SingleCounter end={580544000} step={9375000} />
                ) : (
                  "0"
                )}
              </span>
              <span className="text-lg ms-1">&nbsp;{t("nLiters")}</span>
            </span>
          </div>
          <div className="opacity-80">{t("lWaterAvoided")}</div>
        </div>

        <div>
          <div className="h-20 text-6xl font-serif text-stroke-base-100 flex items-center">
            <a
              href="https://heyzine.com/flip-book/0c17a4fe2a.html"
              target="_blank"
              rel="noreferrer"
              className="btn btn-primary btn-circle"
              aria-label="our impact"
            >
              <span className="feather feather-arrow-right rtl:hidden" />
              <span className="feather feather-arrow-left ltr:hidden" />
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
