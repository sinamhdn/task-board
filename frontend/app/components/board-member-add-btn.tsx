import type { ReactNode } from "react";
import AddMemberIcon from "~/assets/add_member.svg?react";

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
        <AddMemberIcon
          className="w-12 h-12 dark:fill-white fill-black"
          aria-label="add new member button."
          role="img"
        />
      </button>
      {children}
    </>
  );
}

export default BoardMemberAddButton;
