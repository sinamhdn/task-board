import ClickAwayListener from "react-click-away-listener";

function BoardMemberAddForm({
  handleCancelAddNewBoardClick,
}: {
  handleCancelAddNewBoardClick: () => void;
}) {
  return (
    <ClickAwayListener onClickAway={handleCancelAddNewBoardClick}>
      <div className="add-new-member-form">
        <p>ADD NEW MEMBER FORM</p>
        <form action=""></form>
      </div>
    </ClickAwayListener>
  );
}

export default BoardMemberAddForm;
