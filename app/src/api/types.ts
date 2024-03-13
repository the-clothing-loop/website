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
  paused_until: string | null;
  i18n: string;
  longitude?: number;
  latitude?: number;
  accepted_toh?: boolean;
  accepted_dpa?: boolean;
  notification_chain_uids?: string[];
}

export interface Bag {
  id: number;
  number: string;
  color: string;
  chain_uid: UID;
  user_uid: UID;
  updated_at: string;
}

export interface BulkyItem {
  id: number;
  title: string;
  message: string;
  image_url: string;
  chain_uid: UID;
  user_uid: UID;
  created_at: string;
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
  total_members?: number;
  total_hosts?: number;
  route_privacy?: number;
  rules_override?: string;
  headers_override?: string;
  theme?: string;
  is_app_disabled?: boolean;
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
  minimal_cost: number;
  optimal_path: UID[];
}
