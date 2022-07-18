import { FlyToInterpolator } from "react-map-gl";

export enum InterestedSizes {
  BABY = "1",
  ONE_TO_FOUR_YEARS_OLD = "2",
  FIVE_TO_TWELVE_YEARS_OLD = "3",
  WOMEN_SMALL = "4",
  WOMEN_MEDIUM = "5",
  WOMEN_LARGE = "6",
  WOMEN_PLUS_SIZE = "7",
  MEN_SMALL = "8",
  MEN_MEDIUM = "9",
  MEN_LARGE = "A",
  MEN_PLUS_SIZE = "B",
}

export enum Categories {
  CHILDREN = "1",
  WOMEN = "2",
  MEN = "3",
}

export interface UserChainLL {
  user_uid: string;
  chain_uid: string;
  is_chain_admin: boolean;
}

export interface User {
  uid: string;
  email: string;
  name: string;
  phone_number: string;
  email_verified: boolean;
  chains: UserChainLL[];
  address: string;
  interested_sizes: InterestedSizes[];
  is_admin: boolean;
}

// Old
// --------------------------
export interface IChain {
  id: string;
  name: string;
  description: string;
  address: string;
  latitude: number;
  longitude: number;
  radius: number;
  categories: { gender: [string]; size: [string] };
  published: boolean;
  openToNewMembers: boolean;
}

export interface IUser {
  [key: string]: any;
  uid: string | null;
  email: string;
  address: string;
  name: string;
  phoneNumber: string;
  chainId: string | null;
  emailVerified: boolean;
  newsletter: boolean;
  role: string | null;
  interestedSizes: string[];
}

export interface IViewPort {
  longitude: number;
  latitude: number;
  width: string;
  height: string;
  zoom: number;
  transitionDuration?: number;
  transitionInterpolator?: FlyToInterpolator;
}
