import React from "react";

import { Chain } from "../api/types";
import { chainGetAll } from "../api/chain";

export const ChainsContext = React.createContext<Chain[]>([]);

export const ChainsProvider = ({ children }: { children: React.ReactNode }) => {
  const [chains, setChains] = React.useState<Chain[]>([]);

  React.useEffect(() => {
    chainGetAll().then((res) => {
      setChains(res.data);
    });
  }, []);

  return (
    <ChainsContext.Provider value={chains}>{children}</ChainsContext.Provider>
  );
};
