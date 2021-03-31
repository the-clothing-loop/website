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
  const snapshot = await db.collection("users").where("chainId", "==", chainReference).get()
  return snapshot.docs.map((doc) => (
    { id: doc.id, ...doc.data() } as IUser
  ));
};

export { addUser, getUsersForChain };
