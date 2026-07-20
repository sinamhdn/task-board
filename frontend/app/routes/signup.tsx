import type { Route } from "./+types/signup";

export function meta({}: Route.MetaArgs) {
  return [{ title: "Signup" }, { name: "description", content: "Signup!" }];
}

function Signup() {
  return <div className="signup-component"></div>;
}

export default Signup;
