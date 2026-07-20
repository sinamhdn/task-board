import { Outlet, redirect, useLoaderData } from "react-router";
import type { Route } from "./+types/protected";
import { getCurrentUser } from "~/utils/auth";
import { useDispatch } from "react-redux";
import { useEffect } from "react";
import { setCurrentUser } from "~/state/userSlice";

export async function clientLoader({ request }: Route.ClientLoaderArgs) {
  const token = localStorage.getItem("jwt");

  if (!token) {
    throw redirect("/signup");
  }

  let current_user = await getCurrentUser(token);

  return { token, current_user };
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
  const { token, current_user } = useLoaderData<typeof clientLoader>();
  const dispatch = useDispatch();
  useEffect(() => {
    if (current_user) {
      dispatch(setCurrentUser(current_user));
    }
  });
  // undefined until clientLoader resolves
  // if (!data) {
  //   return <div>Loading...</div>; // or spinner
  // }
  return <Outlet />;
}
