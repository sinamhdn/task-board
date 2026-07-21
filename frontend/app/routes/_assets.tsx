import type { Route } from "./+types/_assets";

export async function loader({ request }: Route.LoaderArgs) {
  const url = new URL(request.url);

  // Return 204 for static asset requests
  if (
    url.pathname === "/favicon.ico" ||
    url.pathname.startsWith("/.well-known/")
  ) {
    return new Response(null, {
      status: 204,
      headers: {
        "Cache-Control": "public, max-age=31536000",
      },
    });
  }

  // Return 404 for other unmatched paths
  throw new Response("Not Found", { status: 404 });
}

// This component never renders
export default function AssetRoute() {
  return null;
}
