import db from "./firebaseConfig";

import { IChain } from "../../types";

const getChain = async (chainId: string) => {
  const chainDoc = await db.collection("chains").doc(chainId).get()
  return {
    chain: chainDoc.data() as IChain,
    chainReference: chainDoc.ref
  };
};

const getChains = async () => {
  return await db.collection("chains")
    .get()
    .then((snapshot: any) => {
      return snapshot.docs.map((x: any) => x.data() as IChain);
    })
    .catch((error: any) => {
      console.error("Error getting chains: ", error);
    });
};

export { getChain, getChains };
