import {
  type RouteConfig,
  layout,
  route,
  index,
} from "@react-router/dev/routes";

export default [
  // Handle static assets first
  route("*", "routes/_assets.tsx"),
  layout("components/layout.tsx", [
    layout("components/protected.tsx", [
      index("routes/boardall.tsx"),
      route("boards/:id", "routes/boardsingle.tsx"),
    ]),
    route("signin", "routes/signin.tsx"),
    route("signup", "routes/signup.tsx"),
  ]),
] satisfies RouteConfig;
