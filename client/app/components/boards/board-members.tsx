import Tooltip from "@mui/material/Tooltip";
import { useEffect, useRef, useState } from "react";
// import {
//   deleteBoardMember,
//   type RecievedBoardsInterface,
// } from "~/state/boardSlice";
import { useAppDispatch, useAppSelector } from "~/state/hooks";
// import type { UserInterface } from "~/state/sessionSlice";
import cs from "classnames";
import type { BoardRecievedInterface, UserRecievedInterface } from "~/state";
import {
  deleteBoardMember,
  getAllBoardMembers,
  resetBoardMembers,
} from "~/state/board-member-slice";
import { randomGradientGenerator } from "~/utils";
import BoardMemberAddButton from "./board-member-add-btn";
import BoardMemberAddForm from "./board-member-add-form";

function BoardMembers({
  token,
  board,
  currentUser,
}: {
  token: string | null;
  board: BoardRecievedInterface;
  currentUser: UserRecievedInterface;
}) {
  const [showFrom, setShowForm] = useState(false);
  const isMember = useRef(false);
  const boardMembers = useAppSelector(
    (state) => state.boardMemberSlice.boardMembers,
  );
  const boardId = useAppSelector((state) => state.boardMemberSlice.boardId);
  const members = boardId === board.id ? boardMembers : [];
  const dispatch = useAppDispatch();

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
    if (token && board.id != boardId) {
      dispatch(getAllBoardMembers({ boardId: board.id, token: token }));
    }
  }, [board.id, token, dispatch]);

  return (
    <div className="board-members-list flex flex-row-reverse mt-10 xl:mt-4 p-1 pr-3 size-fit">
      {board.user_id === currentUser.id && (
        <BoardMemberAddButton handleAddNewMemberClick={handleAddNewMemberClick}>
          <div
            className={cs(
              "board-member-add-form-container z-50",
              // mobile: centered modal
              "fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[min(24rem,calc(100vw-2rem))]",
              // desktop: anchored popover under the add button
              "md:absolute md:left-auto md:top-16 md:right-0 md:translate-x-0 md:translate-y-0 md:w-96",
            )}
          >
            {showFrom && token && (
              <BoardMemberAddForm
                handleCancelAddNewBoardClick={handleCancelAddNewMemberClick}
                board_id={board.id}
                token={token}
              />
            )}
          </div>
        </BoardMemberAddButton>
      )}
      <ul className="flex flex-row-reverse relative mr-1">
        {members.map((member) => (
          <div
            className={cs(
              "rounded-full p-1 relative my-2 -mr-7 first:mr-0 shrink-0 hover:z-10",
              randomGradientGenerator(),
            )}
          >
            <div className="rounded-full bg-white dark:bg-gray-900">
              <li key={member.id}>
                {member.id !== currentUser.id &&
                  currentUser.id === board.user_id &&
                  token && (
                    <button
                      className="absolute top-1 right-1 bg-red-600 rounded-full w-3 h-3 cursor-pointer flex items-center justify-center"
                      onClick={() =>
                        handleRemoveMember(member.id, board.id, token)
                      }
                    >
                      <span className="text-white text-[8px] leading-none">
                        ✕
                      </span>
                    </button>
                  )}
                <Tooltip describeChild title={member.email}>
                  {member?.image_file ? (
                    <img
                      className="max-w-12 rounded-full"
                      src={`/api/v1/static/profile_pics/${member.image_file}`}
                      alt="signed in user profile image."
                    />
                  ) : (
                    <img
                      className="max-w-12 rounded-full"
                      src={`/api/v1/static/profile_pics/default.jpg`}
                      alt="signed in user profile image."
                    />
                  )}
                </Tooltip>
                {/* <p>member.fullname</p> */}
              </li>
            </div>
          </div>
        ))}
      </ul>
    </div>
  );
}

export default BoardMembers;
