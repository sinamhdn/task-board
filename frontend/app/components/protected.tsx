import { Outlet, redirect, useLoaderData } from "react-router";
import type { Route } from "./+types/protected";
import {
  getCurrentUser,
  setCurrentUser,
  type User,
} from "~/state/sessionSlice";
import { useAppDispatch, useAppSelector } from "~/state/hooks";
import { getToken } from "~/utils";
import { useEffect } from "react";
import LoadingSpinner from "./loading-spinner";
import { useActiveWebsocket } from "~/providers/websocket-provider";
import { fetchCurrentUser, removeToken } from "~/utils/auth";
// import { useEffect } from "react";
// import { setCurrentUser } from "~/state/sessionSlice";

export async function clientLoader({ request }: Route.ClientLoaderArgs) {
  const token = getToken();
  console.log("IS TOKEN ALIVE", token);

  // useNavigate is better than this
  // useNavigate is not better because clientLoader runs before component renders and navigate user to /signin but with useNavigate you see protected component for a split second before navigating because react renders the Outlet first the navigates
  if (!token) {
    throw redirect("/signin");
  }

  try {
    let currentUser = await fetchCurrentUser(token);
    // socketioManager.socketConnect(token);
    return { token, currentUser };
  } catch (error) {
    removeToken();
    throw redirect("/signin");
  }
}

clientLoader.hydrate = true as const;

// If you want the loader to re‑run on every navigation, set this
export function shouldRevalidate() {
  return true; // re‑run on every route change
}

// HydrateFallback is rendered while the client loader is running
export function HydrateFallback() {
  return (
    <div>
      <LoadingSpinner spinnerIconClasses="fa fa-spinner fa-spin" />
    </div>
  );
}

export default function ProtectedLayout() {
  const { currentUser: loaderUser } = useLoaderData<typeof clientLoader>();
  const { isConnected, sendMessage } = useActiveWebsocket();
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(setCurrentUser(loaderUser));
  }, [loaderUser, dispatch]);

  useEffect(() => {
    if (isConnected && loaderUser)
      sendMessage({ action: "subscribe", channel: `users:${loaderUser?.id}` });
  }, [isConnected, loaderUser, sendMessage]);

  // useEffect(() => {
  //   if (current_user) {
  //     dispatch(setCurrentUser(current_user));
  //   }
  // });
  // undefined until clientLoader resolves
  // if (!data) {
  //   return <div>Loading...</div>; // or spinner
  // }
  return <Outlet />;
}
