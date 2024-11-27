import { WebSocketClient } from "@mattermost/client";
import { createContext, PropsWithChildren, useState } from "react";
import { UID } from "../api/types";
import * as apiChat from "../api/chat";
import { Sleep } from "../utils/sleep";
import { UserProfile } from "@mattermost/types/users";
import { Client4 } from "../utils/client4";

type State = {
  chat_team: string;
  chat_user: string;
  chat_pass: string;
  client: Client4;
  socket: WebSocketClient;
  user_profiles: Record<string, UserProfile>;
};
type RequiredOrEmpty<T> = T | Partial<Record<keyof T, undefined>>;

const VITE_CHAT_URL = import.meta.env.VITE_CHAT_URL;

export const ChatContext = createContext({
  showNotification: false,
  state: {} as RequiredOrEmpty<State>,
  init: (_: string) => Promise.reject<void>(),
  destroy: () => {},
});

export function ChatProvider({ children }: PropsWithChildren) {
  const [showNotification, setShowNotification] = useState(false);
  let [state, setState] = useState<RequiredOrEmpty<State>>({});

  function init(chainUID: UID) {
    return apiChat.chatPatchUser(chainUID).then(async ({ data }) => {
      const client = new Client4();
      client.setUrl(VITE_CHAT_URL);
      client.setIncludeCookies(false);
      const { token } = await client.login2(
        data.chat_user_name,
        data.chat_pass,
      );
      console.log("1user profile token: ", token);
      client.setToken(token);
      client.setHeader("Token", token);
      console.log("user profile token: ", token);
      const socket = new WebSocketClient();
      const url = client.getWebSocketUrl().replace("http", "ws");
      socket.initialize(url, token);

      await apiChat.chatJoinChannels(chainUID);

      setState({
        chat_team: data.chat_team,
        chat_user: data.chat_user_id,
        chat_pass: data.chat_pass,
        client,
        socket,
        user_profiles: {},
      });
    });
  }
  function destroy() {
    state.socket?.close();
    state = {};
  }

  return (
    <ChatContext.Provider
      value={{
        showNotification,
        state,
        init,
        destroy,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}
