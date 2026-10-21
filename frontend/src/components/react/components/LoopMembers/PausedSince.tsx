import { useTranslation } from "react-i18next";
import type { UserChain } from "../../../../api/types";
import dayjs from "../../util/dayjs";

export default function PausedSince({
  userChain,
  pausedUntil,
}: {
  userChain: UserChain | undefined;
  pausedUntil?: string | null;
}) {
  const { t, i18n } = useTranslation();
  const date = userChain?.paused_at ? dayjs(userChain.paused_at) : null;

  const formatDate = (value: Date) =>
    value.toLocaleDateString(i18n.language, {
      day: "2-digit",
      month: "2-digit",
      year: "2-digit",
    });

  if (!userChain?.is_paused || !date?.isValid()) {
    if (
      !pausedUntil ||
      Date.parse(pausedUntil) <= Date.now() ||
      !dayjs(pausedUntil).isValid()
    )
      return null;
    return (
      <span className="block whitespace-nowrap text-xs font-normal text-grey mt-1">
        {t("pausedUntil")}{" "}
        <time dateTime={pausedUntil}>{formatDate(new Date(pausedUntil))}</time>
      </span>
    );
  }

  const duration = t("nDays", {
    count: Math.max(0, dayjs().diff(date, "days")),
  });
  const shortDate = formatDate(date.toDate());

  return (
    <button
      type="button"
      className="block tooltip focus:tooltip-open whitespace-nowrap text-xs font-normal text-grey mt-1"
      data-tip={duration}
      aria-label={`${t("pausedSince")}: ${shortDate}, ${duration}`}
    >
      {t("pausedSince")}{" "}
      <time dateTime={userChain.paused_at!}>{shortDate}</time>
    </button>
  );
}
