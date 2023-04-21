import dayjs, { Dayjs } from "dayjs";
import dayjs_localizedFormat_plugin from "dayjs/plugin/localizedFormat";
import dayjs_updateLocale_plugin from "dayjs/plugin/updateLocale";
import dayjs_calendar_plugin from "dayjs/plugin/calendar";

dayjs.extend(dayjs_updateLocale_plugin);
dayjs.extend(dayjs_calendar_plugin);
dayjs.extend(dayjs_localizedFormat_plugin);

import "dayjs/locale/nl";
import "dayjs/locale/de";
import "dayjs/locale/fr";
import "dayjs/locale/es";
import "dayjs/locale/sv";
import "dayjs/locale/he";

export default dayjs;
