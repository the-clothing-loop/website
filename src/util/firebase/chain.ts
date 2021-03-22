import db from "./firebaseConfig";

import { IChain } from "../../types";

const getChains = async () => {
  return await db.collection("chains")
    .get()
    .then((snapshot: any) => {
      return snapshot.docs.map((x: any) => x.data() as IChain);
    })
    .catch((error: any) => {
      console.error("Error getting chains: ", error);
    });
};

export default getChains;
