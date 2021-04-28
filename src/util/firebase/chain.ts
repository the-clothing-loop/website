import db from "./firebaseConfig";
import { IChain } from "../../types";

const getChain = async (chainId: string) => {
  const chainDoc = await db
    .collection("chains")
    .doc(chainId)
    .get();
  return {
    chain: chainDoc.data() as IChain,
    chainReference: chainDoc.ref,
  };
};

const getChains = async () => {
  const snapshot = await db.collection("chains").get();
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as IChain));
};

const addChain = (chain: IChain) => {
  db.collection("chains")
    .add(chain)
    .then((docRef) => {
      console.log(`Document successfully written with id: ${docRef.id}!`);
      console.log("Document content:", chain);
    })
    .catch((error) => {
      console.error("Error writing document: ", error);
    });
};

export { getChains, addChain, getChain };
