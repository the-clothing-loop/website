import db from "./firebaseConfig";
import { IUser } from "../../types";
import * as firebase from "firebase/app";

const createUserCallable = firebase.functions().httpsCallable('createUser');
const updateUserCallable = firebase.functions().httpsCallable('updateUser');
const getUserByIdCallable = firebase.functions().httpsCallable('getUserById');
const getUserByEmailCallable = firebase.functions.httpsCallable('getUserByEmail');

const createUser = async (user: IUser, password: string) => {
    await createUserCallable({ password, ...user });
};

const getUserById = async (userId: string) => {
    return await getUserByIdCallable({
      uid: userId,
      idToken: await firebase.auth().currentUser.getIdToken(true)
    }) as IUser;
};

const getUserByEmail = async (email: string) => {
    return await getUserByEmailCallable({
      email: email,
      idToken: await firebase.auth().currentUser.getIdToken(true)
    }) as IUser;
};

const getUsersForChain = async (chainId: string) => {
    const idToken = await firebase.auth().currentUser.getIdToken(true)
    const snapshot = await db
        .collection("users")
        .where("chainId", "==", chainId)
        .get();
    return await Promise.all(snapshot.docs.map((doc: any) => getUserByIdCallable({ uid: doc.id, idToken }))) as IUser[];
};

const updateUser = async (user: IUser) => {
    const idToken = await firebase.auth().currentUser.getIdToken(true)
    await updateUserCallable({ idToken, ...user });
};

export { createUser, getUserById, getUserByEmail, getUsersForChain, updateUser };
