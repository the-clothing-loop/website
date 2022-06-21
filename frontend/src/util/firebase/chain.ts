import db from "./firebaseConfig";
import { IChain } from "../../types";
import firebase from "firebase/app";
import "firebase/auth";
import "firebase/functions";

const functions = firebase
  .app()
  .functions(process.env.REACT_APP_FIREBASE_REGION);

if (process.env.REACT_APP_USE_EMULATOR == "true") {
  functions.useEmulator("localhost", 5001);
}

const createChainCallable = functions.httpsCallable("createChain");
const addUserToChainCallable = functions.httpsCallable("addUserToChain");
const addUserAsChainAdminCallable = functions.httpsCallable(
  "addUserAsChainAdmin"
);

export interface ICreateChain {
  name: string;
  description: string;
  address: string;
  latitude: number;
  longitude: number;
  categories: { gender: [string]; size: [string] };
  published: boolean;
  uid: string;
}

// Return chain data for one chain by id
const getChain = async (chainId: string) => {
  const snapshot = await db.collection("chains").doc(chainId).get();
  if (snapshot.exists) {
    return { id: chainId, ...snapshot.data() } as IChain;
  }
};

// Return data for all chains
const getChains = async () => {
  const snapshot = await db.collection("chains").get();
  return snapshot.docs.map(
    // some chains were created before the "openToNewMembers" field
    // existed, so we provide the default value of true
    (doc: any) =>
      ({ id: doc.id, openToNewMembers: true, ...doc.data() } as IChain)
  );
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

export const addUserAsChainAdmin = async (chainId: string, uid: string) => {
  await addUserAsChainAdminCallable({ uid, chainId });
};

export { getChains, createChain, getChain, addUserToChain, updateChain };
