import React, { useEffect, useState } from "react";
import firebase from "firebase/app";
import "firebase/auth";
import { getUserById } from "../util/firebase/user";
import { IUser } from "../types";

type AuthProps = {
  user: firebase.User | null;
  userData: IUser | null;
  loading: boolean;
};

export const AuthContext = React.createContext<AuthProps>({ user: null, loading: true, userData: null});

export const AuthProvider = ({ children }: any) => {
  const [user, setUser] = useState(null as firebase.User | null);
  const [userData, setUserData] = useState(null as IUser | null);
  const [previousUid, setPreviousUid] = useState("");
  const [loading, setLoading] = useState(true);
  useEffect(() => {
      if (process.env.REACT_APP_USE_EMULATOR == 'true') {
        firebase.auth().useEmulator('http://localhost:9099');
      }

      firebase.auth().onAuthStateChanged(async (user: firebase.User | null) => {
      setUser(user);
      setLoading(false);
      if (user?.uid && user?.uid !== previousUid) {
        setUserData(await getUserById(user.uid));
        setPreviousUid(user.uid);
      } else {
        setUserData(null);
        setPreviousUid("");
      }
    });
  }, []);
  const contextValue = {
    user,
    userData,
    loading
  };
  return <AuthContext.Provider value={contextValue}>
    {children}
	</AuthContext.Provider>;
}