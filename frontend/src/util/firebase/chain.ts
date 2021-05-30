import db from "./firebaseConfig";
import { IChain } from "../../types";

// Return chain data for one chain by id
const getChain = async (chainId: string) => {
  const snapshot = await db
    .collection("chains")
    .doc(chainId)
    .get();
  return { id: chainId, ...snapshot.data() } as IChain;
};

// Return data for all chains
const getChains = async () => {
  const snapshot = await db.collection("chains").get();
  return snapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() } as IChain));
};

const addChain = async (chain: IChain) => {
  try {
    const docRef = await db.collection("chains").add(chain);
    console.log(
      `Document successfully written with id: ${docRef.id}! and content ${chain}`
    );
  } catch (error) {
    console.error("Error writing document: ", error);
  }
};

const updateChain = (chainId: string, chain: IChain) => {
  db.collection("chains")
    .doc(chainId)
    .set(chain, { merge: true });
};

export { getChains, addChain, getChain, updateChain };
