import type { Route } from "./+types/boardedit";

export function meta({ matches }: Route.MetaArgs) {
  // Find the root match
  const rootMatch = matches.find((match) => match?.id === "root");
  // Extract the root's meta descriptors (if any)
  const rootMeta = rootMatch?.meta ?? [];
  // Define this route's meta
  const pageMeta = [
    { title: "Edit Board" },
    { name: "description", content: "Edit Board." },
  ];
  // Merge: root first, then page-specific (page wins on duplicates)
  return [...rootMeta, ...pageMeta];
}

function BoardEdit() {
  return <div className="board-edit"></div>;
}

export default BoardEdit;
