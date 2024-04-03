import { atom } from "nanostores";
import type { Chain } from "../api/types";

export const $chains = atom<Chain[]>([]);
