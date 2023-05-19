import { Event, UID } from "./types";

interface EventGetAllParams {
  latitude: number;
  longitude: number;
  radius: number;
}

export interface EventCreateBody {
  name: string;
  description?: string;
  latitude: number;
  longitude: number;
  address: string;
  price_currency: string | null;
  price_value: number;
  link: string;
  date: string;
  date_end: string | null;
  genders: string[];
  chain_uid?: string;
  image_url: string;
  image_delete_url?: string;
}
export type EventUpdateBody = Partial<EventCreateBody> & { uid: UID };

/** 5 months */
export const EVENT_IMAGE_EXPIRATION = 60 * 60 * 24 * 30 * 5;

export function eventGetAll(params?: EventGetAllParams) {
  return window.axios.get<Event[]>("/v2/event/all", { params });
}
export function eventGet(uid: UID) {
  return window.axios.get<Event>(`/v2/event/${uid}`);
}

export function eventCreate(event: EventCreateBody) {
  return window.axios.post<{ uid: UID }>("/v2/event", event);
}

export function eventUpdate(event: EventUpdateBody) {
  return window.axios.patch<never>("/v2/event", event);
}

export function eventDelete(uid: UID) {
  return window.axios.delete<never>(`/v2/event/${uid}`);
}

export function eventICalURL(uid: UID): string {
  return `${window.axios.defaults.baseURL}/v2/event/${uid}/ical`;
}
