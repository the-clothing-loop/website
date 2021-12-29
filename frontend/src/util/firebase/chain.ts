import db from "./firebaseConfig";
import { IChain } from "../../types";
import firebase from "firebase/app";
import "firebase/auth";
import "firebase/functions";

const functions = firebase
  .app()
  .functions(process.env.REACT_APP_FIREBASE_REGION);

const createChainCallable = functions.httpsCallable("createChain");
const addUserToChainCallable = functions.httpsCallable("addUserToChain");

export interface ICreateChain {
  name: string;
  description: string;
  address: string;
  latitude: number;
  longitude: number;
  categories: { gender: [string] };
  published: boolean;
  uid: string;
}

// Return chain data for one chain by id
const getChain = async (chainId: string) => {
  const snapshot = await db.collection("chains").doc(chainId).get();
  return { id: chainId, ...snapshot.data() } as IChain;
};

// Return data for all chains
const getChains = async () => {
  const snapshot = await db.collection("chains").get();
  return snapshot.docs.map(
    (doc: any) => ({ id: doc.id, ...doc.data() } as IChain)
  );
};

const getChainsLength = async () => {
  const snapshot = await db.collection("chains").get();

  return snapshot.docs.length;
};

const createChain = async (chain: ICreateChain): Promise<string> => {
  return (await createChainCallable(chain)).data.id;
};

const addUserToChain = async (chainId: string, userId: string) => {
  await addUserToChainCallable({
    uid: userId,
    chainId,
  });
};

const updateChain = (chainId: string, chain: {}): Promise<void> => {
  return db.collection("chains").doc(chainId).set(chain, { merge: true });
};
export {
  getChains,
  createChain,
  getChain,
  addUserToChain,
  updateChain,
  getChainsLength,
};
