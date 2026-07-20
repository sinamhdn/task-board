import type { Route } from "./+types/signin";

export function meta({}: Route.MetaArgs) {
  return [{ title: "Signin" }, { name: "description", content: "Signin!" }];
}

function Signin() {
  return <div className="signin-component"></div>;
}

export default Signin;
