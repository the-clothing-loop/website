import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

admin.initializeApp();

const db = admin.firestore();

const ADMIN_EMAILS = [
  "pim.sauter@gmail.com",
  "timstokman@gmail.com",
];

const BASE_DOMAIN = "http://localhost:3000";
const VERIFY_URL = BASE_DOMAIN + "/verify-email";
const VERIFY_SUBJECT = "Verify e-mail for clothing chain";
const REGION = "europe-west1";

export const createUser =
  functions.region(REGION).https.onCall(
      async (data: any) => {
        functions.logger.debug("createUser parameters", data);
        const [
          email,
          chainId,
          name,
          phoneNumber,
          checkedNewsletter,
          checkedActionsNewsletter,
          address,
        ] = [
          data.email,
          data.chainId,
          data.name,
          data.phoneNumber,
          data.checkedNewsletter === true,
          data.checkedActionsNewsletter === true,
          data.address,
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
        return {};
      });

export const updateUser =
  functions.region(REGION).https.onCall(
      async (data: any, context: functions.https.CallableContext) => {
        functions.logger.debug("updateUser parameters", data);
        const [
          uid,
          chainId,
          name,
          phoneNumber,
          checkedNewsletter,
          checkedActionsNewsletter,
          address,
        ] = [
          data.uid,
          data.chainId,
          data.name,
          data.phoneNumber,
          data.checkedNewsletter === true,
          data.checkedActionsNewsletter === true,
          data.address,
        ];

        if (context.auth?.uid === uid || context.auth?.token?.role === "admin") {
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
          return {};
        } else {
          throw new functions.https.HttpsError("permission-denied", "You don't have permission to update this user");
        }
      });

export const getUserById =
  functions.region(REGION).https.onCall(
      async (data: any, context: functions.https.CallableContext) => {
        functions.logger.debug("getUserById parameters", data);
        const uid = data.uid;
        const user = await admin.auth().getUser(uid);
        if (user && (context.auth?.uid === uid || context.auth?.token?.role === "admin")) {
          const userData = await db.collection("users").doc(uid).get();
          return {
            uid: user.uid,
            email: user.email,
            name: user.displayName,
            phoneNumber: user.phoneNumber,
            emailVerified: user.emailVerified,
            chainId: userData.get("chainId"),
            address: userData.get("address"),
            checkedNewsletter: userData.get("checkedNewsletter"),
            checkedActionsNewsletter: userData.get("checkedActionsNewsletter"),
          };
        } else {
          throw new functions.https.HttpsError("permission-denied", "You don't have permission to retrieve information about this user");
        }
      });

export const getUserByEmail =
  functions.region(REGION).https.onCall(
      async (data: any, context: functions.https.CallableContext) => {
        functions.logger.debug("getUserByEmail parameters", data);
        const email = data.email;
        const user = await admin.auth().getUserByEmail(email);
        if (user && (context.auth?.uid === user.uid || context?.auth?.token?.role === "admin")) {
          const userData = await db.collection("users").doc(user.uid).get();
          return {
            uid: user.uid,
            email: user.email,
            name: user.displayName,
            phoneNumber: user.phoneNumber,
            emailVerified: user.emailVerified,
            chainId: userData.get("chainId"),
            address: userData.get("address"),
            checkedNewsletter: userData.get("checkedNewsletter"),
            checkedActionsNewsletter: userData.get("checkedActionsNewsletter"),
          };
        } else {
          throw new functions.https.HttpsError("permission-denied", "You don't have permission to retrieve information about this user");
        }
      });
