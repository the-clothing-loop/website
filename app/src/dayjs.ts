import dayjs from "dayjs";
import dayjs_weekOfYear from "dayjs/plugin/weekOfYear";
import "dayjs/locale/de";
import "dayjs/locale/nl";

dayjs.extend(dayjs_weekOfYear);

export default dayjs;
