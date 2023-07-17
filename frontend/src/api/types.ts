export type UID = string;

export interface User {
  uid: UID;
  email: string;
  name: string;
  phone_number: string;
  email_verified: boolean;
  chains: UserChain[];
  address: string;
  sizes: string[];
  is_root_admin: boolean;
  pause_until: string | null;
  i18n: string;
  longitude?: number;
  latitude?: number;
}

export interface Bag {
  id: number;
  number: string;
  color: string;
  chain_uid: UID;
  user_uid: UID;
  updated_at: string;
}

export interface UserChain {
  user_uid: UID;
  chain_uid: UID;
  is_chain_admin: boolean;
  is_approved: boolean;
  created_at: string;
}

export interface Chain {
  uid: UID;
  name: string;
  description: string;
  address: string;
  latitude: number;
  longitude: number;
  radius: number;
  genders: string[] | null;
  sizes: string[] | null;
  published: boolean;
  open_to_new_members: boolean;
  rules_override?: string;
  total_members?: number;
  total_hosts?: number;
}

export interface Event {
  uid: UID;
  name: string;
  description: string;
  price_currency: string | null;
  price_value: number;
  link: string;
  address: string;
  latitude: number;
  longitude: number;
  genders: string[] | null;
  date: string;
  date_end: string | null;
  chain_uid?: UID;
  user_uid: string;
  user_name: string;
  user_email: string;
  chain_name: string;
  image_url?: string;
}

export interface OptimalPath {
  minimal_cost: number
  optimal_path: UID[]
}