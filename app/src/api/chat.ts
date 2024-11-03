import axios from "./axios";

export interface RespChatPatchUser {
  chat_team: string;
  chat_user: string;
  chat_pass: string;
}
export function chatPatchUser(chain_uid: string) {
  return axios.patch<RespChatPatchUser>(`/v2/chat/user`, { chain_uid });
}

export interface RespChatCreateChannel {
  chat_channel: string;
}
export function chatCreateChannel(
  chain_uid: string,
  name: string,
  color: string,
) {
  return axios.post<RespChatCreateChannel>(`/v2/chat/channel/create`, {
    chain_uid,
    name,
    color,
  });
}

export function chatDeleteChannel(chain_uid: string, channel_id: string) {
  return axios.post<never>(`/v2/chat/channel/delete`, {
    chain_uid,
    channel_id,
  });
}

export function chatJoinChannels(chain_uid: string) {
  return axios.post<never>(`/v2/chat/channel/join`, {
    chain_uid,
  });
}
