import { redirect, useLocation } from "react-router";
import type { RecievedBoardsInterface } from "~/state/boardSlice";
import { deleteBoardMember } from "~/state/boardSlice";
import Tooltip from "@mui/material/Tooltip";
import { useEffect, useState } from "react";
import BoardMemberAddButton from "./board-member-add-btn";
import BoardMemberAddForm from "./board-member-add-form";
import { useAppDispatch } from "~/state/hooks";
import { getToken } from "~/utils";

function BoardMembers() {
  const [showFrom, setShowForm] = useState(false);
  const location = useLocation();
  const board: RecievedBoardsInterface = location.state.board;
  const dispatch = useAppDispatch();
  const [token, setToken] = useState("");

  useEffect(() => {
    const token = getToken();
    if (token) setToken(token);
    else throw redirect("/signin");
  }, []);

  const handleAddNewMemberClick = () => {
    setShowForm(true);
  };

  const handleCancelAddNewMemberClick = () => {
    setShowForm(false);
  };

  const handleRemoveMember = (
    member_id: number,
    board_id: number,
    token: string,
  ): void => {
    dispatch(deleteBoardMember({ board_id, member_id, token }));
  };

  return (
    <div className="board-members-list flex flex-row-reverse">
      <ul className="flex flex-row-reverse relative">
        {board.members.map((member) => (
          <li className="flex-auto m-2 relative" key={member.id}>
            <button
              className="absolute top-0.5 right-0.5 bg-red-600 rounded-full w-3 h-3 text-center text-[10px]"
              onClick={() => handleRemoveMember(member.id, board.id, token)}
            >
              X
            </button>
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
          board_id={board.id}
          token={token}
        />
      )}
    </div>
  );
}

export default BoardMembers;
