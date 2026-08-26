import add_member from "~/assets/add_member.svg";

function BoardMemberAddButton({
  handleAddNewMemberClick,
}: {
  handleAddNewMemberClick: () => void;
}) {
  return (
    <button
      className="add-new-member-btn cursor-pointer dark:text-white text-black"
      onClick={handleAddNewMemberClick}
    >
      <img className="max-w-12" src={add_member} alt="add new member button." />
    </button>
  );
}

export default BoardMemberAddButton;
