import axios from "./axios";

export interface RespChatPatchUser {
  chat_pass: string;
}
export function chatPatchUser() {
  return axios.patch<RespChatPatchUser>(`/v2/chat/user/password`);
}

export function chatCreateChannel(chain_uid: string, channel_id: string) {
  return axios.post<never>(`/v2/chat/channel/create`, {
    chain_uid,
    channel_id,
  });
}

export function chatDeleteChannel(chain_uid: string, channel_id: string) {
  return axios.post<never>(`/v2/chat/channel/delete`, {
    chain_uid,
    channel_id,
  });
}

// export function chatJoinChannels(chain_uid: string) {
//   return axios.post<never>(`/v2/chat/channel/join`, {
//     chain_uid,
//   });
// }
