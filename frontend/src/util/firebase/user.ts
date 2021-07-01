import db from "./firebaseConfig";
import { IUser } from "../../types";
import firebase from "firebase/app";
import "firebase/auth";
import "firebase/functions";

const functions = firebase.app().functions(process.env.REACT_APP_FIREBASE_REGION);

const createUserCallable = functions.httpsCallable('createUser');
const updateUserCallable = functions.httpsCallable('updateUser');
const getUserByIdCallable = functions.httpsCallable('getUserById');
const getUserByEmailCallable = functions.httpsCallable('getUserByEmail');

interface ICreateUser {
  email: string;
  address: string;
  name: string;
  phoneNumber: string;
  chainId: string | null;
  newsletter: boolean;
  actionsNewsletter: boolean;
}

const createUser = async (user: ICreateUser): Promise<string> => {
  return (await createUserCallable(user)).data.id;
};

const getUserById = async (userId: string): Promise<IUser> => {
  return (await getUserByIdCallable({
    uid: userId
  })).data as IUser;
};

const getUserByEmail = async (email: string): Promise<IUser> => {
  return (await getUserByEmailCallable({
    email: email
  })).data as IUser;
};

const getUsersForChain = async (chainId: string): Promise<IUser[]> => {
  const idToken = await firebase.auth().currentUser?.getIdToken(true)
  const snapshot = await db
      .collection("users")
      .where("chainId", "==", chainId)
      .get();
  var userRetrieval = snapshot.docs.map(async (doc: any): Promise<IUser> => (await getUserByIdCallable({ uid: doc.id, idToken })).data);
  return await Promise.all(userRetrieval);
};

const updateUser = async (user: IUser): Promise<void> => {
  await updateUserCallable(user);
};

export { createUser, getUserById, getUserByEmail, getUsersForChain, updateUser };
