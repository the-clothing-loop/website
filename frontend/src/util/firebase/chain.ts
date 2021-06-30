import db from "./firebaseConfig";
import { IChain } from "../../types";
import firebase from "firebase/app";
import "firebase/auth";
import "firebase/functions";

const functions = firebase.app().functions(process.env.REACT_APP_FIREBASE_REGION);

const createChainCallable = functions.httpsCallable('createChain');
const addUserToChainCallable = functions.httpsCallable('addUserToChain');

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

const createChain = async (chain: IChain, userId: string): Promise<string> => {
  return (await createChainCallable({ uid: userId, ...chain })).data.id;
};

const addUserToChain = async (chainId: string, userId: string) => {
  await addUserToChainCallable({
    uid: userId,
    chainId
  });
}

const updateChain = (chainId: string, chain: IChain) => {
  db.collection("chains")
    .doc(chainId)
    .set(chain, { merge: true });
};

export { getChains, createChain, getChain, updateChain, addUserToChain };
