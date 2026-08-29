import AddMemberIcon from "~/assets/add_member.svg?react";

function BoardMemberAddButton({
  handleAddNewMemberClick,
}: {
  handleAddNewMemberClick: () => void;
}) {
  return (
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
  );
}

export default BoardMemberAddButton;
