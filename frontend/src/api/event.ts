import axios from "./axios";
import { Event, UID } from "./types";

interface EventGetAllParams {
  latitude: number;
  longitude: number;
  radius: number;
}
export type EventCreateBody = Omit<Event, "uid">;

export function eventGetAll(params?: EventGetAllParams) {
  return axios.get<Event[]>("/v2/event/all", { params });
}
export function eventGet(uid: UID) {
  return axios.get<Event>(`/v2/event/${uid}`);
}

export function eventCreate(event: EventCreateBody) {
  return axios.post<{ uid: UID }>("/v2/event", event);
}

export type EventUpdateBody = Partial<Event> & { uid: UID };

export function eventUpdate(event: EventUpdateBody) {
  return axios.patch<never>("/v2/event", event);
}

export function eventDelete(uid: UID) {
  return axios.delete<never>(`/v2/event/${uid}`);
}

export function eventUploadImage(uid: UID, file: File) {
  return axios.put<never>(`/v2/event/${uid}/image`, file.slice(), {
    responseType: "blob",
  });
}

export function eventRemoveImage(uid: UID) {
  return axios.delete<never>(`/v2/event/${uid}/image`);
}

export function eventICalURL(uid: UID): string {
  return `${axios.defaults.baseURL}/v2/event/${uid}/ical`;
}
