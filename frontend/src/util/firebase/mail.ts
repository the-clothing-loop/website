import firebase from "firebase/app";
import "firebase/auth";
import "firebase/functions";

const functions = firebase
  .app()
  .functions(process.env.REACT_APP_FIREBASE_REGION);

if (process.env.REACT_APP_USE_EMULATOR == "true") {
  functions.useEmulator("localhost", 5001);
}

const contactMailCallable = functions.httpsCallable("contactMail");

export interface IContactMail {
  name: string;
  email: string;
  message: string;
}

const contactMail = async (mail: IContactMail) => {
  await contactMailCallable(mail);
};
export { contactMail };
