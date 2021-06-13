import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

admin.initializeApp();

const db = admin.firestore();

const ADMIN_EMAILS = [
  "pim.sauter@gmail.com",
  "timstokman@gmail.com",
];

const VERIFY_URL = "https://localhost/verify-email";
const VERIFY_SUBJECT = "Verify e-mail for clothing chain";
const REGION = "europe-west1";

export const createUser =
  functions.region(REGION).https.onRequest(
      async (request: functions.Request, response: functions.Response) => {
        try {
          functions.logger.debug("createUser parameters", request.body);
          const [
            email,
            chainId,
            name,
            phoneNumber,
            checkedNewsletter,
            checkedActionsNewsletter,
            address,
          ] = [
            request.body.email,
            request.body.chainId,
            request.body.name,
            request.body.phoneNumber,
            request.body.checkedNewsletter === true,
            request.body.checkedActionsNewsletter === true,
            request.body.address,
          ];
          const userRecord =
                  await admin.auth()
                      .createUser({
                        email: email,
                        phoneNumber: phoneNumber,
                        displayName: name,
                        disabled: false,
                      });
          functions.logger.debug("created user", userRecord);
          const verificationLink =
              await admin.auth()
                  .generateEmailVerificationLink(
                      email,
                      {
                        handleCodeInApp: false,
                        url: `${VERIFY_URL}?email=${email}`,
                      });
          const verificationEmail = `Click here <a href="${verificationLink}">here</a> to verify your e-mail`;
          functions.logger.debug("sending verification email", verificationEmail);
          await db.collection("mail")
              .add({
                to: email,
                message: {
                  subject: VERIFY_SUBJECT,
                  html: verificationEmail,
                },
              });
          functions.logger.debug("Adding user supplemental information to firebase");
          await db.collection("users")
              .doc(userRecord.uid)
              .set({
                chainId,
                address,
                checkedNewsletter,
                checkedActionsNewsletter,
              });
          if (ADMIN_EMAILS.includes(email)) {
            functions.logger.debug(`Adding user ${email} as admin`);
            await admin.auth()
                .setCustomUserClaims(userRecord.uid, {role: "admin"});
          }
          // TODO: Subscribe user in mailchimp if needed
          await response.status(200).end();
        } catch (e) {
          functions.logger.error(e);
          throw e;
        }
      });

export const updateUser =
  functions.region(REGION).https.onRequest(
      async (request: functions.Request, response: functions.Response) => {
        try {
          functions.logger.debug("updateUser parameters", request.body);
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
            const userRecord =
                      await admin.auth()
                          .updateUser(
                              uid,
                              {
                                phoneNumber: phoneNumber,
                                displayName: name,
                                disabled: false,
                              });
            functions.logger.debug("updated user", userRecord);
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
          }
        } catch (e) {
          functions.logger.error(e);
          throw e;
        }
      });

export const getUserById =
  functions.region(REGION).https.onRequest(
      async (request: functions.Request, response: functions.Response) => {
        functions.logger.debug("getUserById parameters", request.body);
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
        functions.logger.debug("getUserByEmail parameters", request.body);
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
