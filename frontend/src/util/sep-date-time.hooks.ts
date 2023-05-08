import { ChangeEvent, useState } from "react";
import dayjs from "./dayjs";

export function useSepDateTime(
  dateTime: string,
  setDateTime: (d: string) => void
) {
  const [valueDate, _setValueDate] = useState(() =>
    dayjs(dateTime).format("YYYY-MM-DD")
  );
  const [valueTime, _setValueTime] = useState(() =>
    dayjs(dateTime).format("HH:mm")
  );

  function setValueDate(e: ChangeEvent<HTMLInputElement>) {
    const d = e.target.valueAsDate;
    console.log(d);

    if (d) {
      let _date = dayjs(dateTime);
      let val = dayjs(d).utc();
      _date = _date.date(val.date()).month(val.month()).year(val.year());
      let formattedDate = _date.format();
      if (dayjs(formattedDate).isValid()) {
        setDateTime(formattedDate);
      }
    }
    _setValueDate(e.target.value);
  }
  function setValueTime(e: ChangeEvent<HTMLInputElement>) {
    const d = e.target.valueAsDate;
    console.log(d);

    if (d) {
      let _date = dayjs(dateTime);
      let val = dayjs(d).utc();
      _date = _date.hour(val.hour()).minute(val.minute());
      let formattedDate = _date.format();
      if (dayjs(formattedDate).isValid()) {
        setDateTime(formattedDate);
      }
    }
    _setValueTime(e.target.value);
  }

  return {
    date: { value: valueDate, onChange: setValueDate },
    time: { value: valueTime, onChange: setValueTime },
  };
}
