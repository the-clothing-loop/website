import db from "./firebaseConfig";

import { IUser } from "../../types";

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

export default addUser;
