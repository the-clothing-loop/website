import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

admin.initializeApp();

const ADMIN_EMAILS = ['pim.sauter@gmail.com', 'timstokman@gmail.com']

export const createUser = functions.https.onRequest(async (request, response) => {
    let [email, chainId] = [request.body.email, request.body.chainId];
});

// // Start writing Firebase Functions
// // https://firebase.google.com/docs/functions/typescript
//
// export const helloWorld = functions.https.onRequest((request, response) => {
//   functions.logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });
