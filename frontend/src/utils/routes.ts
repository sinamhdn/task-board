import {
  type RouteConfig,
  layout,
  route,
  index,
} from "@react-router/dev/routes";

export default [
  layout("../components/MainLayout.tsx", [
    index("../pages/BoardsAll.tsx"),
    route("boards/:id", "./pages/BoardsSingle.tsx"),
  ]),
] satisfies RouteConfig;
