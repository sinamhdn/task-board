import type { Route } from "./+types/boardall";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "All Boards" },
    { name: "description", content: "All Boards!" },
  ];
}

function BoardsAll() {
  return <div className="all-boards-component"></div>;
}

export default BoardsAll;
