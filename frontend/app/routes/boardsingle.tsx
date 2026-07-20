import type { Route } from "./+types/boardsingle";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Single Boards" },
    { name: "description", content: "Single Boards!" },
  ];
}

function BoardsSingle() {
  return <div className="single-board-component"></div>;
}

export default BoardsSingle;
