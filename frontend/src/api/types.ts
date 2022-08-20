import { Size } from "./enums";

export type UID = string;

export interface User {
  uid: UID;
  email: string;
  name: string;
  phone_number: string;
  email_verified: boolean;
  chains: UserChain[];
  address: string;
  sizes: Size[];
  is_admin: boolean;
}

export interface UserChain {
  user_uid: UID;
  chain_uid: UID;
  is_chain_admin: boolean;
}

export interface Chain {
  uid: UID;
  name: string;
  description: string;
  address: string;
  latitude: number;
  longitude: number;
  radius: number;
  genders: string[];
  sizes: string[];
  published: boolean;
  openToNewMembers: boolean;
}
