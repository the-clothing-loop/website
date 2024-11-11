import { ChainResponse } from "./typex2";
export type { User, BulkyItem } from "./typex2";

export type UID = string;

export type Chain = ChainResponse;

export interface OptimalPath {
  minimal_cost: number;
  optimal_path: UID[];
}
