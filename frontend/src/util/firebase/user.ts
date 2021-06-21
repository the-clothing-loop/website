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

const createUser = async (user: IUser, password: string): Promise<void> => {
    await createUserCallable({ password, ...user });
};

const getUserById = async (userId: string): Promise<IUser> => {
    return (await getUserByIdCallable({
      uid: userId,
      idToken: await firebase.auth().currentUser?.getIdToken(true)
    })).data as IUser;
};

const getUserByEmail = async (email: string): Promise<IUser> => {
    return (await getUserByEmailCallable({
      email: email,
      idToken: await firebase.auth().currentUser?.getIdToken(true)
    })).data as IUser;
};

const getUsersForChain = async (chainId: string): Promise<IUser[]> => {
    const idToken = await firebase.auth().currentUser?.getIdToken(true)
    const snapshot = await db
        .collection("users")
        .where("chainId", "==", chainId)
        .get();
    var userRetrieval = snapshot.docs.map(async (doc: any) => (await getUserByIdCallable({ uid: doc.id, idToken })).data);
    return (await Promise.all(userRetrieval)) as IUser[];
};

const updateUser = async (user: IUser): Promise<void> => {
    const idToken = await firebase.auth().currentUser?.getIdToken(true)
    await updateUserCallable({ idToken, ...user });
};

export { createUser, getUserById, getUserByEmail, getUsersForChain, updateUser };
