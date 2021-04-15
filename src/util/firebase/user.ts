import db from "./firebaseConfig";
import { DocumentReference } from "@firebase/firestore-types";
import { IUser, IChain } from "../../types";

const addUser = (user: IUser) => {
  db.collection("users")
    .add({ user })
    .then((docRef) => {
      console.log(`Document successfully written with id ${docRef.id}!`);
    })
    .catch((error) => {
      console.error("Error writing document: ", error);
    });
};

const getUsersForChain = async (chainReference: DocumentReference) => {
  const snapshot = await db
    .collection("users")
    .where("chainId", "==", chainReference)
    .get();
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as IUser));
};

const getAllUsers = async () => {
  const snapshot = await db.collection("users").get();
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as IUser));
};

// Return true if user email is not in our database yet
const validateNewUser = async (email: string) => {
  const users = await getAllUsers();
  const emails = users.map((user) => user.email as string);
  return !emails.includes(email);
};

export { addUser, getUsersForChain, getAllUsers, validateNewUser };
