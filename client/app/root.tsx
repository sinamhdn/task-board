import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "react-router";

import type { Route } from "./+types/root";
import "./app.css";
import CombinedProviders from "./providers/index.tsx";

export const links: Route.LinksFunction = () => [
  {
    // Preconnect for Google Fonts
    rel: "preconnect",
    href: "https://fonts.googleapis.com",
  },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
  {
    // Custom Font
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap",
  },
];

export const meta: Route.MetaFunction = () => [
  {
    name: "description",
    content: "Task Board",
  },
  {
    name: "author",
    content: "Sina Mohammadian",
  },
  {
    // Open Graph Tags: The title of the page for social media sharing. It can match the title tag or be more descriptive.
    property: "og:title",
    content: "FastAPI Blog",
  },
  {
    // Open Graph Tags: Typically set to "website" for static sites or "article" for content-heavy pages.
    property: "og:type",
    content: "website",
  },
  {
    // Open Graph Tags: The URL of the page, used to ensure link previews resolve to the correct page.
    property: "og:url",
    content: "",
  },
  {
    // Open Graph Tags: URL of an image that represents the page. Useful for link previews.
    property: "og:image",
    content: "",
  },
  {
    // Open Graph Tags: Provides an alternative text for the image to improve accessibility.
    property: "og:image:alt",
    content: "utf-8",
  },
  { name: "viewport", content: "width=device-width, initial-scale=1" },
  {
    // Set a theme color that matches your website's primary color
    name: "theme-color",
    content: "#527c9f",
  },
];

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <Meta />
        <Links />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return (
    <CombinedProviders>
      <Outlet /> {/* This is where your MainLayout will render */}
    </CombinedProviders>
  );
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  let message = "Oops!";
  let details = "An unexpected error occurred.";
  let stack: string | undefined;

  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? "404" : "Error";
    details =
      error.status === 404
        ? "The requested page could not be found."
        : error.statusText || details;
  } else if (import.meta.env.DEV && error && error instanceof Error) {
    details = error.message;
    stack = error.stack;
  }

  return (
    <main className="pt-16 p-4 container mx-auto">
      <h1>{message}</h1>
      <p>{details}</p>
      {stack && (
        <pre className="w-full p-4 overflow-x-auto">
          <code>{stack}</code>
        </pre>
      )}
    </main>
  );
}
