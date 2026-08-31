import { redirect } from "react-router";
import {
  deleteBoardMember,
  type RecievedBoardsInterface,
} from "~/state/boardSlice";
import Tooltip from "@mui/material/Tooltip";
import { useEffect, useState } from "react";
import BoardMemberAddButton from "./board-member-add-btn";
import BoardMemberAddForm from "./board-member-add-form";
import { useAppDispatch } from "~/state/hooks";
import { getToken } from "~/utils";
import type { User } from "~/state/sessionSlice";

function BoardMembers({
  board,
  currentUser,
}: {
  board: RecievedBoardsInterface;
  currentUser: User;
}) {
  const [showFrom, setShowForm] = useState(false);
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
    <div className="board-members-list flex flex-row-reverse mt-5 mr-10 p-1 pr-3 border size-fit rounded-md">
      <BoardMemberAddButton handleAddNewMemberClick={handleAddNewMemberClick}>
        <div className="board-member-add-form-container relative right-85 top-18">
          {showFrom && (
            <BoardMemberAddForm
              handleCancelAddNewBoardClick={handleCancelAddNewMemberClick}
              board_id={board.id}
              token={token}
            />
          )}
        </div>
      </BoardMemberAddButton>
      <ul className="flex flex-row-reverse relative">
        {board.members.map((member) => (
          <li className="flex-auto m-2 relative" key={member.id}>
            {member.id !== currentUser.id && (
              <button
                className="absolute top-0.5 right-0.5 bg-red-600 rounded-full w-3 h-3 cursor-pointer flex items-center justify-center"
                onClick={() => handleRemoveMember(member.id, board.id, token)}
              >
                <span className="text-white text-[8px] leading-none">✕</span>
              </button>
            )}
            <Tooltip describeChild title={member.email}>
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
    </div>
  );
}

export default BoardMembers;
