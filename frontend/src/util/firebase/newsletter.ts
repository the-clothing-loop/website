import firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/functions';

const functions = firebase
  .app()
  .functions(process.env.REACT_APP_FIREBASE_REGION);

if (process.env.REACT_APP_USE_EMULATOR == 'true') {
  functions.useEmulator('localhost', 5001);
}

const subscribeToNewsletterCallable = functions.httpsCallable(
  'subscribeToNewsletter'
);

interface ISubscriber {
  name: string;
  email: string;
}

export const subscribeToNewsletter = async (interestedUser: ISubscriber) => {
  await subscribeToNewsletterCallable(interestedUser);
};
