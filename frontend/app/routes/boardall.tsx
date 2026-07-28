import type { Route } from "./+types/boardall";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "All Boards" },
    { name: "description", content: "All Boards!" },
  ];
}

function BoardAll() {
  return <div className="all-boards-component"></div>;
}

export default BoardAll;
