import axios from "./axios";
import {
  ChatCreateChannelRequest,
  ChatCreateChannelResponse,
  ChatDeleteChannelRequest,
  ChatJoinChannelsRequest,
  ChatPatchUserRequest,
  ChatPatchUserResponse,
} from "./typex2";

export function chatPatchUser(chain_uid: string) {
  return axios.patch<ChatPatchUserResponse>(`/v2/chat/user`, {
    chain_uid,
  } satisfies ChatPatchUserRequest);
}
export function chatCreateChannel(
  chain_uid: string,
  name: string,
  color: string,
) {
  return axios.post<ChatCreateChannelResponse>(`/v2/chat/channel/create`, {
    chain_uid,
    name,
    color,
  } satisfies ChatCreateChannelRequest);
}

export function chatDeleteChannel(chain_uid: string, channel_id: string) {
  return axios.post<never>(`/v2/chat/channel/delete`, {
    chain_uid,
    channel_id,
  } satisfies ChatDeleteChannelRequest);
}

export function chatJoinChannels(chain_uid: string) {
  return axios.post<never>(`/v2/chat/channel/join`, {
    chain_uid,
  } satisfies ChatJoinChannelsRequest);
}
