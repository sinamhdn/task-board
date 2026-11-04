import Tooltip from "@mui/material/Tooltip";
import type { ReactNode } from "react";
import AddMemberIcon from "~/assets/add-signs.svg?react";

function BoardMemberAddButton({
  handleAddNewMemberClick,
  children,
}: {
  handleAddNewMemberClick: () => void;
  children: ReactNode;
}) {
  return (
    <>
      <button
        className="add-new-member-btn cursor-pointer"
        onClick={handleAddNewMemberClick}
      >
        <Tooltip describeChild title="Add member">
          <AddMemberIcon
            className="w-12 h-12 dark:fill-white fill-black"
            aria-label="add new member button."
            role="img"
          />
        </Tooltip>
      </button>
      {children}
    </>
  );
}

export default BoardMemberAddButton;
