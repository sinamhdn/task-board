import type { Route } from "./+types/signin";
import { useSelector } from "react-redux";

export function meta({}: Route.MetaArgs) {
  return [{ title: "Signin" }, { name: "description", content: "Signin!" }];
}

function Signin() {
  const loadingState = useSelector((state: RootState) => state.session.status);

  return <div className="signin-component"></div>;
}

export default Signin;
