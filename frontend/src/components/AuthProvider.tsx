import React, { useEffect, useState } from "react";
import firebase from "firebase/app";
import "firebase/auth";

type AuthProps = {
  user: firebase.User | null;
  loading: boolean;
};

export const AuthContext = React.createContext<AuthProps>({ user: null, loading: true});

export const AuthProvider = ({ children }: any) => {
  const [user, setUser] = useState(null as firebase.User | null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    firebase.auth().onAuthStateChanged((user: any) => {
      setUser(user);
      setLoading(false);
    });
  });
  const contextValue = {
    user,
    loading
  };
  return <AuthContext.Provider value={contextValue}>
    {children}
	</AuthContext.Provider>;
}