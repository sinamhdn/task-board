import { useEffect } from "react";
import { Outlet, redirect, useLoaderData } from "react-router";
import { useWebsocketContext } from "~/providers/websocket-provider";
import { useAppDispatch, useAppSelector } from "~/state/hooks";
import { getCurrentUser, setCurrentUser } from "~/state/session-slice";
import { getTokenCookie } from "~/utils";
import { fetchCurrentUser, removeTokenCookie } from "~/utils/auth";
import type { Route } from "./+types/protected";
import LoadingSpinner from "./loading-spinner";
// import { useEffect } from "react";
// import { setCurrentUser } from "~/state/sessionSlice";

export async function clientLoader({ request }: Route.ClientLoaderArgs) {
  const token = getTokenCookie();

  if (!token) {
    // useNavigate is better than this
    // useNavigate is not better because clientLoader runs before component renders and navigate user to /signin but with useNavigate you see protected component for a split second before navigating because react renders the Outlet first the navigates
    throw redirect("/signin");
  }

  try {
    let currentUser = await fetchCurrentUser(token);
    // socketioManager.socketConnect(token);
    return { token, currentUser };
  } catch (error) {
    removeTokenCookie();
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
  const { currentUser: loadedCurrentUser } =
    useLoaderData<typeof clientLoader>();
  const { isConnected, sendMessage } = useWebsocketContext();
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(setCurrentUser(loadedCurrentUser));
  }, [loadedCurrentUser, dispatch]);

  useEffect(() => {
    if (isConnected && loadedCurrentUser)
      sendMessage({
        action: "subscribe",
        channel: `users:${loadedCurrentUser?.id}`,
      });
  }, [isConnected, loadedCurrentUser, sendMessage]);

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
