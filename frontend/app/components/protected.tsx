import { Outlet, redirect, useLoaderData } from "react-router";
import type { Route } from "./+types/protected";
import { getCurrentUser } from "~/state/sessionSlice";
import { useAppDispatch } from "~/state/hooks";
import { socketioManager } from "~/socketio";
import { getToken } from "~/utils";
import { useEffect } from "react";
// import { useEffect } from "react";
// import { setCurrentUser } from "~/state/sessionSlice";

export async function clientLoader({ request }: Route.ClientLoaderArgs) {
  const token = getToken();
  console.log("IS TOKEN ALIVE", token);

  if (!token) {
    throw redirect("/signin");
  }

  socketioManager.socketConnect(token);

  // let current_user = await getCurrentUser(token);

  return { token /*current_user*/ };
}

clientLoader.hydrate = true as const;

// If you want the loader to re‑run on every navigation, set this
export function shouldRevalidate() {
  return true; // re‑run on every route change
}

// HydrateFallback is rendered while the client loader is running
export function HydrateFallback() {
  return <div>Loading...</div>;
}

export default function ProtectedLayout() {
  const { token } = useLoaderData<typeof clientLoader>();
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(getCurrentUser(token));
  }, [dispatch, token]);

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
