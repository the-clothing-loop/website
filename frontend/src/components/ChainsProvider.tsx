import React from 'react';

import { getChains } from '../util/firebase/chain';
import { IChain } from '../types';

export const ChainsContext = React.createContext<IChain[]>([]);

export const ChainsProvider = ({ children }: { children: React.ReactNode }) => {
  const [chains, setChains] = React.useState<IChain[]>([]);

  React.useEffect(() => {
    (async () => {
      setChains(await getChains());
    })();
  }, []);

  return (
    <ChainsContext.Provider value={chains}>{children}</ChainsContext.Provider>
  );
};
