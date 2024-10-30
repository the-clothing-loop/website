import { Client4, WebSocketClient } from "@mattermost/client";
import { createContext, PropsWithChildren, useState } from "react";
import { UID } from "../api/types";
import * as apiChat from "../api/chat";

type State = {
  chat_team: string;
  chat_user: string;
  chat_pass: string;
  client: Client4;
  socket: WebSocketClient;
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

      await client.loginById(data.chat_user, data.chat_pass);
      const socket = new WebSocketClient();
      const url = client.getWebSocketUrl().replace("http", "ws");
      socket.initialize(url, client.getToken());

      await apiChat.chatJoinChannels(chainUID);

      setState({
        chat_team: data.chat_team,
        chat_user: data.chat_user,
        chat_pass: data.chat_pass,
        client,
        socket,
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
