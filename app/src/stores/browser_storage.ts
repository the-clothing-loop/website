import Cookies from "js-cookie";

const IS_DEVELOPMENT = import.meta.env.VITE_APP_VERSION === "development";
const IS_ACCEPTANCE = import.meta.env.VITE_APP_VERSION === "acceptance";

const IS_DEV_MODE = import.meta.env.DEV;

function cookiePostfix(name: string): string {
  if (IS_DEVELOPMENT) return name + "_dev";
  if (IS_ACCEPTANCE) return name + "_acc";
  return name;
}

// Cookies
// ----------------------------------------------------------------

const KEY_C_USER_UID = cookiePostfix("user_uid");
export const cookieUserUID = {
  get: () => {
    console.log(KEY_C_USER_UID);
    return Cookies.get(KEY_C_USER_UID);
  },
};
