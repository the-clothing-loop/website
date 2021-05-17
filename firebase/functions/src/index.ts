import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

admin.initializeApp();

const db = admin.firestore();

const ADMIN_EMAILS = ['pim.sauter@gmail.com', 'timstokman@gmail.com']

export const createUser = functions.https.onRequest(async (request, response) => {
    let [email, chainId, name, phoneNumber, checkedNewsletter, checkedActionsNewsletter, address, password] = [
        request.body.email,
        parseInt(request.body.chainId),
        request.body.name,
        request.body.phoneNumber,
        request.body.checkedNewsletter == true,
        request.body.checkedActionsNewsletter == true,
        request.body.address,
        request.body.password
    ];
    try {
        let userRecord =
            await admin.auth()
                       .createUser({
                           email: email,
                           phoneNumber: phoneNumber,
                           password: password,
                           displayName: name,
                           disabled: false,
                        });
        await userRecord.sendVerificationEmail();
        await db.collection("users")
                .doc(userRecord.getUid())
                .set({
                    chainId,
                    checkedNewsletter,
                    checkedActionsNewsletter,
                    address
                });
        if (ADMIN_EMAILS.includes(email)) {
            await admin.auth()
                       .setCustomUserClaims(userRecord.getUid(), { role: "admin" });
        }
        // TODO: Subscribe user in mailchimp if needed
        await response.status(200).send();
    } catch(error) {
      functions.logger.info("Error creating user: ", error);
      throw error;
    }
});
