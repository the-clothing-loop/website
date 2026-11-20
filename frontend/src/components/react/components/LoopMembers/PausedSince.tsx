import { useTranslation } from "react-i18next";
import type { UserChain } from "../../../../api/types";
import dayjs from "../../util/dayjs";
import { getPauseDetails } from "../../util/pause-details";

export default function PausedSince({
  userChain,
  pausedUntil,
  plain = false,
}: {
  userChain: UserChain | undefined;
  pausedUntil?: string | null;
  plain?: boolean;
}) {
  const { t, i18n } = useTranslation();
  const pause = getPauseDetails(userChain, pausedUntil);
  if (!pause) return null;
  if (!pause.date) return <span>{t("pausedMembers")}</span>;
  const date = dayjs(pause.date);
  const shortDate = date.toDate().toLocaleDateString(i18n.language, {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
  if (plain || pause.kind === "until")
    return (
      <span
        className={
          plain
            ? undefined
            : "block whitespace-nowrap text-xs font-normal text-grey mt-1"
        }
      >
        {pause.kind === "until" ? `${t("pausedUntil")} ` : ""}
        <time dateTime={pause.date}>{shortDate}</time>
      </span>
    );
  const duration = t("nDays", {
    count: Math.max(0, dayjs().diff(date, "days")),
  });
  return (
    <button
      type="button"
      className="block tooltip focus:tooltip-open whitespace-nowrap text-xs font-normal text-grey mt-1"
      data-tip={duration}
      aria-label={`${t("pausedSince")}: ${shortDate}, ${duration}`}
    >
      {t("pausedSince")} <time dateTime={pause.date}>{shortDate}</time>
    </button>
  );
}
