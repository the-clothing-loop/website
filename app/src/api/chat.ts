import axios from "./axios";
export interface RespPatchGetOrJoinRoom {
   chat_team: string;
   chat_channel: string;
   chat_user: string;
   chat_token?: string;
 }
 export function patchGetOrJoinRoom(chainUID: string, renewToken: boolean) {
   return axios.patch<RespPatchGetOrJoinRoom>(
     `/v2/chat/${chainUID}/room`,
     undefined,
     {
       params: { renew_token: renewToken },
     },
   );
 }