import { Client4 as BaseClient4 } from "@mattermost/client";
import { UserProfile } from "@mattermost/types/users";

export class Client4 extends BaseClient4 {
  includeCookies = false; // default `true` value won't work with reverse proxy
  defaultHeaders = {
    "Content-Type": "application/json", // fix defaults
  };

  // Original `login` does not return response headers so we have to make our own to get `resp.headers.token`!
  // Below is a simplified version of `login` with no fuss
  // https://github.com/mattermost/mattermost-redux/blob/master/src/client/client4.ts#L678
  async login2(
    login_id: string,
    password: string,
  ): Promise<UserProfile & { token: string }> {
    this.trackEvent("api", "api_users_login");

    const resp = await (this as any).doFetchWithResponse(
      `${this.getUsersRoute()}/login`,
      {
        method: "POST",
        body: JSON.stringify({
          login_id,
          password,
        }),
      },
    );

    return { ...resp.data, token: resp.headers.get("Token") || "" };
  }
}
