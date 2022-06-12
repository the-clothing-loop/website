import { FlyToInterpolator } from "react-map-gl";

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
  open: boolean;
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
  role: "admin" | "chainAdmin" | null;
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
