import { useLocation } from "react-router";
import type { RecievedBoardsInterface } from "~/state/boardSlice";
import Tooltip from "@mui/material/Tooltip";
import { useState } from "react";
import BoardMemberAddButton from "./board-member-add-btn";
import BoardMemberAddForm from "./board-member-add-form";

function BoardMembers() {
  const [showFrom, setShowForm] = useState(false);
  const location = useLocation();
  const board: RecievedBoardsInterface = location.state.board;

  const handleAddNewMemberClick = () => {
    setShowForm(true);
  };

  const handleCancelAddNewMemberClick = () => {
    setShowForm(false);
  };

  return (
    <div className="board-members-list flex flex-row-reverse">
      <ul className="flex flex-row-reverse">
        {board.members.map((member) => (
          <li className="flex-auto m-2" key={member.id}>
            <Tooltip describeChild title={member.full_name}>
              {member?.image_file ? (
                <img
                  className="max-w-12"
                  src={`${import.meta.env.VITE_API_URL}/static/profile_pics/${member.image_file}`}
                  alt="signed in user profile image."
                />
              ) : (
                <img
                  className="max-w-12"
                  src={`${import.meta.env.VITE_API_URL}/static/profile_pics/default.jpg`}
                  alt="signed in user profile image."
                />
              )}
            </Tooltip>
            {/* <p>{member.full_name}</p> */}
          </li>
        ))}
      </ul>
      <BoardMemberAddButton handleAddNewMemberClick={handleAddNewMemberClick} />
      {showFrom && (
        <BoardMemberAddForm
          handleCancelAddNewBoardClick={handleCancelAddNewMemberClick}
        />
      )}
    </div>
  );
}

export default BoardMembers;
