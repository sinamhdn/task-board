import Tooltip from "@mui/material/Tooltip";
import { useEffect, useRef, useState } from "react";
// import {
//   deleteBoardMember,
//   type RecievedBoardsInterface,
// } from "~/state/boardSlice";
import { useAppDispatch, useAppSelector } from "~/state/hooks";
// import type { UserInterface } from "~/state/sessionSlice";
import type { BoardRecievedInterface, UserRecievedInterface } from "~/state";
import {
  deleteBoardMember,
  getAllBoardMembers,
  resetBoardMembers,
} from "~/state/boardMemberSlice";
import { getToken } from "~/utils";
import LoadingSpinner from "../loading-spinner";
import BoardMemberAddButton from "./board-member-add-btn";
import BoardMemberAddForm from "./board-member-add-form";

function BoardMembers({
  board,
  currentUser,
}: {
  board: BoardRecievedInterface;
  currentUser: UserRecievedInterface;
}) {
  const [showFrom, setShowForm] = useState(false);
  const isMember = useRef(false);
  const token = getToken();
  const boardMembers = useAppSelector(
    (state) => state.boardMemberSlice.boardMembers,
  );
  const boardId = useAppSelector((state) => state.boardMemberSlice.boardId);
  const members = boardId === board.id ? boardMembers : [];
  const dispatch = useAppDispatch();

  if (!token) return <LoadingSpinner />;

  if (boardMembers.some((member) => member.id === currentUser.id))
    isMember.current = true;

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
    dispatch(
      deleteBoardMember({ boardId: board_id, memberId: member_id, token }),
    );
  };

  useEffect(() => {
    dispatch(resetBoardMembers());
    if (board.id != boardId) {
      dispatch(getAllBoardMembers({ boardId: board.id, token: token }));
    }
  }, [board.id, token, dispatch]);

  return (
    <div className="board-members-list flex flex-row-reverse mt-5 mr-10 p-1 pr-3 size-fit">
      {board.user_id === currentUser.id && (
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
      )}
      <ul className="flex flex-row-reverse relative">
        {members.map((member) => (
          <li className="flex-auto m-2 relative" key={member.id}>
            {member.id !== currentUser.id &&
              currentUser.id === board.user_id && (
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
                  className="max-w-12 rounded-full"
                  src={`${import.meta.env.VITE_API_URL}/static/profile_pics/${member.image_file}`}
                  alt="signed in user profile image."
                />
              ) : (
                <img
                  className="max-w-12 rounded-full"
                  src={`${import.meta.env.VITE_API_URL}/static/profile_pics/default.jpg`}
                  alt="signed in user profile image."
                />
              )}
            </Tooltip>
            {/* <p>member.fullname</p> */}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default BoardMembers;
