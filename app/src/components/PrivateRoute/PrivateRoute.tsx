import { PropsWithChildren, useContext } from "react";
import { Route, Redirect, RouteProps } from "react-router-dom";

import { IsAuthenticated } from "../../Store";
import Loading from "./Loading";
import Offline from "./Offline";

type PrivateRouteProps = PropsWithChildren<{
  isAuthenticated: IsAuthenticated;
}> &
  RouteProps;
export default function PrivateRoute({
  children,
  isAuthenticated,
  ...rest
}: PrivateRouteProps) {
  return (
    <Route {...rest}>
      {
        /* ? (
        <Offline />
      ) :*/ isAuthenticated === IsAuthenticated.LoggedOut ? (
          <Redirect to="/login" />
        ) : isAuthenticated === IsAuthenticated.OfflineLoggedIn ||
          isAuthenticated === IsAuthenticated.LoggedIn ? (
          children
        ) : (
          <Loading />
        )
      }
    </Route>
  );
}
