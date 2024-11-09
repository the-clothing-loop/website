import type * as Typex from "./typex2";

export type UID = string;

export type User = Typex.User;

export type Bag = Typex.Bag;

export type BulkyItem = Typex.BulkyItem;

export type UserChain = Typex.UserChain;

export type Chain = Typex.ChainResponse;

export type Event = Typex.Event;

export interface OptimalPath {
  minimal_cost: number;
  optimal_path: UID[];
}
