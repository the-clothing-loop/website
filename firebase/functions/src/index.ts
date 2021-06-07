import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

admin.initializeApp();

const db = admin.firestore();

const ADMIN_EMAILS = [
  "pim.sauter@gmail.com",
  "timstokman@gmail.com",
];

const VERIFY_URL = "https://clothingchain.com/verify-email";
const VERIFY_SUBJECT = "Verify e-mail for clothing chain";
const REGION = "europe-west1";

export const createUser =
  functions.region(REGION).https.onRequest(
      async (request: functions.Request, response: functions.Response) => {
        const [
          email,
          chainId,
          name,
          phoneNumber,
          checkedNewsletter,
          checkedActionsNewsletter,
          address,
          password,
        ] = [
          request.body.email,
          request.body.chainId,
          request.body.name,
          request.body.phoneNumber,
          request.body.checkedNewsletter === true,
          request.body.checkedActionsNewsletter === true,
          request.body.address,
          request.body.password,
        ];
        if (await admin.auth().getUserByEmail(email)) {
          functions.logger.error("Trying to create user that already exists");
          response.status(500).end();
          return;
        }
        try {
          const userRecord =
                  await admin.auth()
                      .createUser({
                        email: email,
                        phoneNumber: phoneNumber,
                        password: password,
                        displayName: name,
                        disabled: false,
                      });
          const verificationEmail =
              await admin.auth()
                  .generateEmailVerificationLink(
                      email,
                      {
                        handleCodeInApp: false,
                        url: `${VERIFY_URL}?email=${email}`,
                      });
          await db.collection("mail")
              .add({
                to: email,
                message: {
                  subject: VERIFY_SUBJECT,
                  html: verificationEmail,
                },
              });
          await db.collection("users")
              .doc(userRecord.uid)
              .set({
                chainId,
                address,
                checkedNewsletter,
                checkedActionsNewsletter,
              });
          if (ADMIN_EMAILS.includes(email)) {
            await admin.auth()
                .setCustomUserClaims(userRecord.uid, {role: "admin"});
          }
          // TODO: Subscribe user in mailchimp if needed
          await response.status(200).end();
        } catch (error) {
          functions.logger.error("Error creating user: ", error);
          response.status(500).end();
        }
      });

export const updateUser =
  functions.region(REGION).https.onRequest(
      async (request: functions.Request, response: functions.Response) => {
        const [
          uid,
          chainId,
          name,
          phoneNumber,
          checkedNewsletter,
          checkedActionsNewsletter,
          address,
          idToken,
        ] = [
          request.body.uid,
          request.body.chainId,
          request.body.name,
          request.body.phoneNumber,
          request.body.checkedNewsletter === true,
          request.body.checkedActionsNewsletter === true,
          request.body.address,
          request.body.idToken,
        ];
        const claims = await admin.auth().verifyIdToken(idToken);

        if (claims.uid === uid || claims.role === "admin") {
          try {
            const userRecord =
                      await admin.auth()
                          .updateUser(
                              uid,
                              {
                                phoneNumber: phoneNumber,
                                displayName: name,
                                disabled: false,
                              });
            await db.collection("users")
                .doc(userRecord.uid)
                .set({
                  chainId,
                  address,
                  checkedNewsletter,
                  checkedActionsNewsletter,
                });
            // TODO: Update user in mailchimp if needed
            await response.status(200).end();
          } catch (error) {
            functions.logger.info("Error updating user: ", error);
            response.status(500).end();
          }
        }
      });

export const getUserById =
  functions.region(REGION).https.onRequest(
      async (request: functions.Request, response: functions.Response) => {
        const idToken = request.body.idToken;
        const uid = request.body.uid;
        const claims = await admin.auth().verifyIdToken(idToken);
        const user = await admin.auth().getUser(uid);
        if (user && (claims.uid === uid || claims.role === "admin")) {
          const userData = await db.collection("users").doc(uid).get();
          response.send(JSON.stringify({
            uid: user.uid,
            email: user.email,
            name: user.displayName,
            phoneNumber: user.phoneNumber,
            emailVerified: user.emailVerified,
            chainId: userData.get("chainId"),
            address: userData.get("address"),
            checkedNewsletter: userData.get("checkedNewsletter"),
            checkedActionsNewsletter: userData.get("checkedActionsNewsletter"),
          })).status(200).end();
        } else {
          response.status(403).end();
        }
      });

export const getUserByEmail =
  functions.region(REGION).https.onRequest(
      async (request: functions.Request, response: functions.Response) => {
        const idToken = request.body.idToken;
        const email = request.body.email;
        const claims = await admin.auth().verifyIdToken(idToken);
        const user = await admin.auth().getUserByEmail(email);
        if (user && (claims.uid === user.uid || claims.role === "admin")) {
          const userData = await db.collection("users").doc(user.uid).get();
          response.send(JSON.stringify({
            uid: user.uid,
            email: user.email,
            name: user.displayName,
            phoneNumber: user.phoneNumber,
            emailVerified: user.emailVerified,
            chainId: userData.get("chainId"),
            address: userData.get("address"),
            checkedNewsletter: userData.get("checkedNewsletter"),
            checkedActionsNewsletter: userData.get("checkedActionsNewsletter"),
          })).end();
        } else {
          response.status(403).end();
        }
      });
