import firebase from "firebase/app";
import "firebase/auth";
import "firebase/functions";

const functions = firebase
  .app()
  .functions(process.env.REACT_APP_FIREBASE_REGION);

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