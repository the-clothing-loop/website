// import { FlyToInterpolator } from "react-map-gl";

export interface IViewPort {
  longitude: number;
  latitude: number;
  width: string;
  height: string;
  zoom: number;
  transitionDuration?: number;
  transitionInterpolator?: null; // FlyToInterpolator;
}
