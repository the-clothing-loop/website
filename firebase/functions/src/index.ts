import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import {UserRecord} from "firebase-functions/lib/providers/auth";
import * as mailchimp from "@mailchimp/mailchimp_marketing";

import payments from "./payments";

admin.initializeApp();

mailchimp.setConfig({
  apiKey: functions.config().mailchimp.api_key,
  server: functions.config().mailchimp.server,
});

const db = admin.firestore();
const region = functions.config().clothingloop.region as string;
const adminEmails = (
  functions.config().clothingloop.admin_emails as string
).split(";");

const ROLE_ADMIN = "admin";
const ROLE_CHAINADMIN = "chainAdmin";

const ToolkitLink =
  "https://drive.google.com/drive/u/0/folders/1iMJzIcBxgApKx89hcaHhhuP5YAs_Yb27";

// https://github.com/firebase/firebase-js-sdk/issues/1881
// If we want to use try/catch with auth functions, we have to wrap it in this
// Auth functions return a "clojure" promise which has a different catch implementation
function wrapInECMAPromise<T>(fn: () => Promise<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    return fn()
      .then((res) => resolve(res))
      .catch((err) => reject(err));
  });
}

const addContactToMailchimpAudience = async (name: string, email: string) => {
  const nameLength = name.split(" ").length;
  const firstName =
    nameLength === 1 ? name : name.split(" ").slice(0, -1).join(" ");
  const lastName = name.split(" ").slice(-1).join(" ");

  await mailchimp.lists.addListMember(
    functions.config().mailchimp.interested_audience_id,
    {
      email_address: email,
      status: "subscribed",
      merge_fields: {
        FNAME: firstName,
        LNAME: lastName,
      },
    }
  );

  console.log("Mailchimp add contact successful");
};

const checkContactExistenceInMailchimpAudience = async (email: string) => {
  try {
    await await mailchimp.lists.getListMember(
      functions.config().mailchimp.interested_audience_id,
      email
    );

    console.log("Mailchimp contact found", email);
  } catch (error) {
    console.log("Mailchimp contact not found");

    return false;
  }

  return true;
};

const updateContactSubscriptionInMailchimpAudience = async (
  email: string,
  isSubscribe: boolean
) => {
  await mailchimp.lists.updateListMember(
    functions.config().mailchimp.interested_audience_id,
    email,
    {
      status: isSubscribe ? "subscribed" : "unsubscribed",
    }
  );

  console.log("Mailchimp update contact subscription successful");
};

export const createUser = functions
  .region(region)
  .https.onCall(async (data: any) => {
    functions.logger.debug("createUser parameters", data);
    const [
      email,
      chainId,
      name,
      phoneNumber,
      newsletter,
      interestedSizes,
      address,
    ] = [
      data.email,
      data.chainId,
      data.name,
      data.phoneNumber,
      data.newsletter,
      data.interestedSizes,
      data.address,
    ];
    let userRecord = null as null | UserRecord;
    try {
      userRecord = await wrapInECMAPromise<UserRecord>(() =>
        admin.auth().createUser({
          email: email,
          phoneNumber: phoneNumber,
          displayName: name,
          disabled: false,
        })
      );
    } catch (e) {
      functions.logger.warn(`Error creating user: ${JSON.stringify(e)}`);
      return {validationError: e};
    }
    functions.logger.debug("created user", userRecord);
    const verificationLink = await admin
      .auth()
      .generateEmailVerificationLink(email, {
        handleCodeInApp: false,
        url: functions.config().clothingloop.base_domain,
      });
    const verificationEmail = `<p>Hello ${name} and welcome to the Clothing Loop!,</p>

      </br>
      <p>Thank you for making the step to create a more sustainable world together, we are so happy to have you!</p>
      <p>First, we need you to verify your email address by clicking <a href="${verificationLink}">here</a></p>.</p>
      <p>(You only have to do this once)</p>
      <p>You will get a notification if a new person signs up.</p>
      </br>
      <p>Everything you need to get started with your Loop you can find in our <a href="${ToolkitLink}">Toolkit folder</a></p>
      <ul>
        <li><p>Our manual on how to set up and run your Loop</p></li>
        <li><p>The template of our app + a tutorial on how to set it up</p></li>
        <li><p>Logos and images</p></li>
        <li><p>A press release template</p></li>
      </ul>
      </br>
      <p>If you have any more questions that are not in our FAQ, please send us an email!</p>
      <p>Happy swapping!</p>
      </br>
      <p>Nichon, on behalf of the Clothing Loop team</p>`;
    functions.logger.debug("sending verification email", verificationEmail);
    await db.collection("mail").add({
      to: email,
      message: {
        subject: "Verify e-mail for The Clothing Loop",
        html: verificationEmail,
      },
    });
    functions.logger.debug("Adding user supplemental information to firebase");
    await db.collection("users").doc(userRecord.uid).set({
      chainId,
      address,
      interestedSizes,
    });
    if (adminEmails.includes(email)) {
      functions.logger.debug(`Adding user ${email} as admin`);
      await admin.auth().setCustomUserClaims(userRecord.uid, {
        role: ROLE_ADMIN,
        chainId: chainId,
      });
    } else {
      await admin
        .auth()
        .setCustomUserClaims(userRecord.uid, {chainId: chainId});
    }

    if (newsletter) {
      try {
        await addContactToMailchimpAudience(name, email);
      } catch (error) {
        console.error("Mailchimp add contact error", email, error);
      }
    }

    return {id: userRecord.uid};
  });

export const createChain = functions
  .region(region)
  .https.onCall(async (data: any, context: functions.https.CallableContext) => {
    functions.logger.debug("createChain parameters", data);

    const [
      uid,
      name,
      description,
      address,
      latitude,
      longitude,
      radius,
      categories,
    ] = [
      data.uid,
      data.name,
      data.description,
      data.address,
      data.latitude,
      data.longitude,
      data.radius,
      data.categories,
    ];

    const user = await admin.auth().getUser(uid);
    const userData = await db.collection("users").doc(uid).get();
    if (
      (!userData.get("chainId") &&
        !user.customClaims?.chainId &&
        user.customClaims?.role !== ROLE_CHAINADMIN) ||
      context.auth?.token.role === ROLE_ADMIN
    ) {
      const chainData = await db.collection("chains").add({
        name,
        description,
        address,
        latitude,
        longitude,
        radius,
        categories,
        published: true,
        chainAdmin: uid,
      });
      db.collection("users").doc(uid).update("chainId", chainData.id);
      await admin.auth().setCustomUserClaims(uid, {
        chainId: chainData.id,
        role: user.customClaims?.role ?? ROLE_CHAINADMIN,
      });

      return {id: chainData.id};
    } else {
      throw new functions.https.HttpsError(
        "permission-denied",
        "You don't have permission to change this user's chain"
      );
    }
  });

export const addUserToChain = functions
  .region(region)
  .https.onCall(async (data: any, context: functions.https.CallableContext) => {
    functions.logger.debug("updateUserToChain parameters", data);

    const {uid, chainId} = data;

    if (context.auth?.uid === uid || context.auth?.token?.role === ROLE_ADMIN) {
      const userReference = db.collection("users").doc(uid);
      const user = await userReference.get();
      const chain = await db.collection("chains").doc(chainId).get();

      if (user.get("chainId") === chainId) {
        functions.logger.warn(
          `user ${uid} is already member of chain ${chainId}`
        );
      } else if (! chain.get("open")) {
        throw new functions.https.HttpsError(
          "failed-precondition",
          "This chain is not currently open to new members"
        );
      } else {
        await userReference.update("chainId", chainId);

        // When switching chains, you're no longer an chain-admin
        if (context.auth?.token?.role === ROLE_CHAINADMIN) {
          await admin.auth().setCustomUserClaims(uid, {chainId: chainId});
        } else {
          await admin.auth().setCustomUserClaims(uid, {
            chainId: chainId,
            role: context.auth?.token?.role,
          });
        }

        await notifyChainAdmin(chainId, uid);
      }
    } else {
      throw new functions.https.HttpsError(
        "permission-denied",
        "You don't have permission to change this user's chain"
      );
    }
  });

const notifyChainAdmin = async (chainId: string, newUserId: string) => {
  const chain = await db.collection("chains").doc(chainId).get();
  const chainAdminUid = await chain.get("chainAdmin");

  const chainAdmin = await admin.auth().getUser(chainAdminUid);
  const adminName = chainAdmin.displayName;
  const adminEmail = chainAdmin.email;

  const newUser = await admin.auth().getUser(newUserId);
  const name = newUser.displayName;
  const email = newUser.email;
  const phone = newUser.phoneNumber;

  await db.collection("mail").add({
    to: adminEmail,
    message: {
      subject: "A participant just joined your Loop!",
      html: ` <p>Hi, ${adminName}</p>
                        <p>A new participant just joined your loop.</p>
                        <p>Please find below the participant's contact information:</p>
                        <ul>
                          <li>Name: ${name}</li>
                          <li>Email: ${email}</li>
                          <li>Phone: ${phone}</li>
                        </ul>
                        <p>Best,</p>
                        <p>Nichon, on behalf of the Clothing Loop team</p>`,
    },
  });
};

export const updateUser = functions
  .region(region)
  .https.onCall(async (data: any, context: functions.https.CallableContext) => {
    functions.logger.debug("updateUser parameters", data);
    const [uid, name, phoneNumber, newsletter, interestedSizes, address] = [
      data.uid,
      data.name,
      data.phoneNumber,
      data.newsletter,
      data.interestedSizes,
      data.address,
    ];

    if (context.auth?.uid === uid || context.auth?.token?.role === ROLE_ADMIN) {
      const userRecord = await admin.auth().updateUser(uid, {
        phoneNumber: phoneNumber,
        displayName: name,
        disabled: false,
      });
      functions.logger.debug("updated user", userRecord);
      await db.collection("users").doc(userRecord.uid).set(
        {
          address,
          interestedSizes,
        },
        {merge: true}
      );

      const userAuth = await admin.auth().getUser(uid);
      const email = userAuth.email!;

      const doesContactExist = await checkContactExistenceInMailchimpAudience(
        email
      );

      if (newsletter) {
        if (doesContactExist) {
          try {
            await updateContactSubscriptionInMailchimpAudience(email, true);
          } catch (error) {
            console.error("Mailchimp subscribe contact error", email, error);
          }
        } else {
          try {
            await addContactToMailchimpAudience(name, email);
          } catch (error) {
            console.error("Mailchimp add contact error", email, error);
          }
        }
      } else if (doesContactExist) {
        try {
          await updateContactSubscriptionInMailchimpAudience(email, false);
        } catch (error) {
          console.error("Mailchimp unsubscribe contact error", email, error);
        }
      }

      return {};
    } else {
      throw new functions.https.HttpsError(
        "permission-denied",
        "You don't have permission to update this user"
      );
    }
  });

export const getUserById = functions
  .region(region)
  .https.onCall(async (data: any, context: functions.https.CallableContext) => {
    functions.logger.debug("getUserById parameters", data);
    const uid = data.uid;
    const user = await admin.auth().getUser(uid);
    if (
      user &&
      (context.auth?.uid === uid ||
        context.auth?.token?.role === ROLE_ADMIN ||
        (context.auth?.token?.role === ROLE_CHAINADMIN &&
          context.auth.token?.chainId === user.customClaims?.chainId))
    ) {
      const userData = await db.collection("users").doc(uid).get();
      return {
        uid: user.uid,
        email: user.email,
        name: user.displayName,
        phoneNumber: user.phoneNumber,
        emailVerified: user.emailVerified,
        chainId: userData.get("chainId"),
        address: userData.get("address"),
        interestedSizes: userData.get("interestedSizes"),
        role: user.customClaims?.role,
      };
    } else {
      throw new functions.https.HttpsError(
        "permission-denied",
        "You don't have permission to retrieve information about this user"
      );
    }
  });

export const getUserByEmail = functions
  .region(region)
  .https.onCall(async (data: any, context: functions.https.CallableContext) => {
    functions.logger.debug("getUserByEmail parameters", data);
    const email = data.email;
    const user = await admin.auth().getUserByEmail(email);
    if (
      user &&
      (context.auth?.uid === user.uid ||
        context.auth?.token?.role === ROLE_ADMIN ||
        (context.auth?.token?.role === ROLE_CHAINADMIN &&
          context.auth.token?.chainId === user.customClaims?.chainId))
    ) {
      const userData = await db.collection("users").doc(user.uid).get();
      return {
        uid: user.uid,
        email: user.email,
        name: user.displayName,
        phoneNumber: user.phoneNumber,
        emailVerified: user.emailVerified,
        chainId: userData.get("chainId"),
        address: userData.get("address"),
        interestedSizes: userData.get("interestedSizes"),
        role: user.customClaims?.role,
      };
    } else {
      throw new functions.https.HttpsError(
        "permission-denied",
        "You don't have permission to retrieve information about this user"
      );
    }
  });

export const contactMail = functions
  .region(region)
  .https.onCall(async (data: any, context: functions.https.CallableContext) => {
    functions.logger.debug("contactMail parameters", data);

    const [name, email, message] = [data.name, data.email, data.message];

    // send user message to the clothing loop team
    await db.collection("mail").add({
      to: functions.config().clothingloop.contact_emails.split(";"),
      message: {
        subject: `ClothingLoop Contact Form - ${name}`,
        html: ` <h3>Name</h3>
                    <p>${name}</p>
                    <h3>Email</h3>
                    <p>${email}</p>
                    <h3>Message</h3>
                    <p>${message}</p>
            `,
      },
    });

    // send confirmation mail to the user
    await db.collection("mail").add({
      to: email,
      message: {
        subject: "Thank you for contacting The Clothing Loop",
        html: ` <p>Hi ${name},</p>
                    <p>Thank you for your message!</p>
                    <p>You wrote:</p>
                    <p>${message}</p>
                    <p>We will contact you as soon as possible.</p>
                    <p>Regards,</p>
                    <p>Nichon, on behalf of the Clothing Loop team</p>`,
      },
    });
  });

export const subscribeToNewsletter = functions
  .region(region)
  .https.onCall(async (data: any, context: functions.https.CallableContext) => {
    functions.logger.debug("subscribeToNewsletter parameters", data);

    const {name, email} = data;

    try {
      await addContactToMailchimpAudience(name, email);
    } catch (error) {
      console.error("Mailchimp add contact error", email, error);
      throw error;
    }

    await db.collection("mail").add({
      to: email,
      message: {
        subject: "Thank you for subscribing to Clothing Loop",
        html: ` <p>Hi ${name},</p>

                <p>Hurrah! You are now subscribed to our newsletter.</p>
                <p> Expect monthly updates full of inspiration, </p>
                <p>swap highlights and all kinds of wonderful Clothing Loop related stories.</p>
              
                <p>And please do reach out if you have exciting news or a nice Clothing Loop story you would like to share.</p>
                <p>We’d love to hear from you! <a href="mailto:hello@clothingloop.org">hello@clothingloop.org</a></p>
                
                <p>Changing the fashion world one swap at a time, let’s do it together!</p>
                
                <p>Thank you for your interest and support.</p>
                
                <p>Nichon, on behalf of the Clothing Loop team</p>`,
      },
    });
  });

export const addUserAsChainAdmin = functions
  .region(region)
  .https.onCall(
    async (
      data: {uid: string; chainId: string},
      context: functions.https.CallableContext
    ) => {
      functions.logger.debug("addUserAsChainAdmin", data);

      const {uid, chainId} = data;

      const callerRole = context.auth?.token?.role;
      const callerChainId = context.auth?.token?.chainId;

      if (callerRole !== ROLE_CHAINADMIN || callerChainId !== chainId) {
        throw new functions.https.HttpsError(
          "permission-denied",
          "You don't have permission to add the user to become loop admin"
        );
      }

      const userToBeAdded = await admin.auth().getUser(uid);
      const userToBeAddedRole = userToBeAdded.customClaims?.role;

      if (!userToBeAddedRole) {
        await admin.auth().setCustomUserClaims(uid, {
          chainId,
          role: ROLE_CHAINADMIN,
        });
      }
    }
  );

export const paymentInitiate = functions
  .region(region)
  .https.onCall(payments.initiate);

export const paymentWebhook = functions
  .region(region)
  .https.onRequest(payments.webhook);
