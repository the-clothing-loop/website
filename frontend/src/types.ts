import { FlyToInterpolator } from "react-map-gl";

// Old
// --------------------------

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
