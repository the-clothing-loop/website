import { useState, useRef, useEffect } from "react";

import SingleCounter from "./SingleCounter";
import useIntersectionObserver from "./hooks";
import { infoGet } from "../../../../api/info";
import { useTranslation } from "react-i18next";
import type { Info } from "../../../../api/typex2";

export default function Counters() {
  const { t } = useTranslation();
  const containerRef = useRef(null);

  const [info, setInfo] = useState<Info>();

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
              <SingleCounter end={info.total_chains || 0} step={193} />
            ) : (
              "0"
            )}
          </div>
          <div className="opacity-80">{t("Loops")}</div>
        </div>
        <div>
          <div className="h-20 text-6xl font-serif text-stroke-base-100">
            {isVisible ? (
              <SingleCounter end={info.total_countries || 0} step={1} />
            ) : (
              "0"
            )}
          </div>
          <div className="opacity-80">{t("countries")}</div>
        </div>

        <div>
          <div className="h-20 text-5xl font-serif text-stroke-base-100">
            {isVisible ? (
              <SingleCounter end={info.total_users || 0} step={397} />
            ) : (
              "0"
            )}
          </div>
          <div className="opacity-80">{t("addresses")}</div>
        </div>
        <div>
          <div className="h-20 text-5xl font-serif text-stroke-base-100">
            {isVisible ? (
              <SingleCounter
                end={info ? Math.floor(info.total_users * 1.79) : 0}
                step={397}
              />
            ) : (
              "0"
            )}
          </div>
          <div className="opacity-80">{t("participants")}</div>
        </div>

        <div className="col-span-2 xl:col-span-1">
          <div className="h-20 text-4xl font-serif flex items-center">
            <span>
              <span className="text-stroke-base-100 tracking-wide">
                {new Intl.NumberFormat().format(1197375)}
              </span>

              <span className="text-lg ms-1">&nbsp;{t("lKg")}</span>
            </span>
          </div>
          <div className="opacity-80">{t("co2EmissionAvoided")}</div>
        </div>

        <div className="col-span-2 xl:col-span-1">
          <div className="h-20 text-4xl font-serif flex items-center">
            <span>
              <span className="text-stroke-base-100 tracking-wide">
                {new Intl.NumberFormat().format(580544000)}
              </span>
              <span className="text-lg ms-1">&nbsp;{t("nLiters")}</span>
            </span>
          </div>
          <div className="opacity-80">{t("lWaterAvoided")}</div>
        </div>

        <div className="col-span-2 xl:col-span-1">
          <a
            className="inline-flex items-center gap-4 my-6 group"
            href="https://heyzine.com/flip-book/a8c1962269.html"
            target="_blank"
            rel="noreferrer"
            aria-label="our impact"
          >
            <div className="flex-shrink-0 h-16 w-16 rounded-full flex justify-center items-center text-2xl bg-yellow-dark group-hover:bg-yellow-darker text-stroke-base-100">
              <span className="icon-arrow-right rtl:hidden" />
              <span className="icon-arrow-left ltr:hidden" />
            </div>
            <div className="text-lg md:text-xl opacity-100 whitespace-normal">
              {t("readOurImpactReport")}
            </div>
          </a>
        </div>
      </div>
    </div>
  );
}
