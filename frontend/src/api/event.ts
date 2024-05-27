import type { Event, UID } from "./types";
import axios from "./axios";

interface EventGetAllParams {
  latitude: number;
  longitude: number;
  radius: number;
}

export type EventPriceType = "free" | "entrance" | "donation" | "perswap";
export interface EventCreateBody {
  name: string;
  description?: string;
  latitude: number;
  longitude: number;
  address: string;
  price_currency: string | null;
  price_value: number;
  price_type: EventPriceType;
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
  return axios.get<Event[]>("/v2/event/all", { params });
}
export interface EventGetPreviousResponse {
  previous_events: Event[];
  previous_total: number;
}
export function eventGetPrevious(
  params?: EventGetAllParams & { include_total?: boolean },
) {
  return axios.get<EventGetPreviousResponse>("/v2/event/previous", {
    params,
  });
}
export function eventGet(uid: UID) {
  return axios.get<Event>(`/v2/event/${uid}`);
}

export function eventCreate(event: EventCreateBody) {
  return axios.post<{ uid: UID }>("/v2/event", event);
}

export function eventUpdate(event: EventUpdateBody) {
  return axios.patch<never>("/v2/event", event);
}

export function eventDelete(uid: UID) {
  return axios.delete<never>(`/v2/event/${uid}`);
}

export function eventICalURL(uid: UID): string {
  return `${axios.defaults.baseURL}/v2/event/${uid}/ical`;
}
