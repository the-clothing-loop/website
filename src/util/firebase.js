// Firebase admin
import firebase from "firebase/app";
import "firebase/firestore";
import dotenv from "dotenv";
dotenv.config();

const firebaseConfig = {
  apiKey: process.env.AIzaSyCATzkzX2v3mTsfO4z5yoqxX54lrOCVY0A,
  authDomain: "fir-map-304420.firebaseapp.com",
  projectId: "firebase-map-304420",
  storageBucket: "firebase-map-304420.appspot.com",
  messagingSenderId: "200800205098",
  appId: "1:200800205098:web:216dbaf88f8d323ba50653",
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

export default db;
