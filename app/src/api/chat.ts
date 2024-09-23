import axios from "./axios";

export interface RespChatPatchUser {
  chat_pass: string;
  chat_user_id: string;
}
export function chatPatchUser() {
  return axios.patch<RespChatPatchUser>(`/v2/chat/user/password`);
}

export function chatCreateGroup(
  chain_uid: string,
  group_id: string | undefined,
) {
  return axios.post<never>(`/v2/chat/group/create`, {
    chain_uid,
    group_id,
  });
}

export function chatDeleteGroup(chain_uid: string, group_id: string) {
  return axios.post<never>(`/v2/chat/group/delete`, {
    chain_uid,
    group_id,
  });
}

// export function chatJoinGroups(chain_uid: string) {
//   return axios.post<never>(`/v2/chat/group/join`, {
//     chain_uid,
//   });
// }
