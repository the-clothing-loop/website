import { Chain } from "../api/types";
import { chainGetAll } from "../api/chain";
import { createContext, PropsWithChildren, useEffect, useState } from "react";

export const ChainsContext = createContext<Chain[]>([]);

export function ChainsProvider({ children }: PropsWithChildren<{}>) {
  const [chains, setChains] = useState<Chain[]>([]);

  useEffect(() => {
    chainGetAll({ filter_out_unpublished: true }).then((res) => {
      setChains(res.data);
    });
  }, []);

  return (
    <ChainsContext.Provider value={chains}>{children}</ChainsContext.Provider>
  );
}
