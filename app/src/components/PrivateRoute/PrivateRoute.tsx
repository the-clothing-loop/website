import { PropsWithChildren } from "react";
import { Route, Redirect, RouteProps } from "react-router-dom";

import { IsAuthenticated } from "../../stores/Store";
import Loading from "./Loading";

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
