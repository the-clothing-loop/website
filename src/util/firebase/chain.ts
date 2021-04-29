import db from "./firebaseConfig";
import { IChain } from "../../types";

// Return chain data for one chain by id
const getChain = async (chainId: string) => {
  const snapshot = await db.collection("chains").doc(chainId).get();
  return {id: chainId, ...snapshot.data()} as IChain;
}

// Return data for all chains
const getChains = async () => {
  const snapshot = await db.collection("chains").get();
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as IChain));
};

const addChain = (chain: IChain) => {
  db.collection("chains")
    .add(chain)
    .then((docRef) => {
      console.log(`Document successfully written with id: ${docRef.id}! and content ${chain}`);
    })
    .catch((error) => {
      console.error("Error writing document: ", error);
    });
};

export { getChains, addChain, getChain };
