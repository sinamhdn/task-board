import { useEffect, useState } from "react";
import { Outlet } from "react-router";
import type { BoardChannelPayloadInterface } from "~/state";
import {
  addBoardDirect,
  removeBoardDirect,
  updateBoardDirect,
} from "~/state/board-slice";
import {
  addCardDirect,
  removeCardDirect,
  updateCardDirect,
} from "~/state/card-slice";
import { clearError } from "~/state/error-slice";
import { useAppDispatch, useAppSelector } from "~/state/hooks";
import {
  addListDirect,
  removeListDirect,
  updateListDirect,
} from "~/state/list-slice";
import { clearSessionStatus, getCurrentUser } from "~/state/session-slice";
import type { RootState } from "~/state/store";
import { getTokenCookie } from "~/utils/auth";
// import FormSubmissionStatusModal from "./form-submission-status-modal";
import {
  addBoardMemberDirect,
  removeBoardMemberDirect,
} from "~/state/board-ember-slice";
import log from "~/utils/logger";
import Header from "./header";
import ServerErrorModal from "./server-error-modal";

const logger = log.getLogger("layout logger");
logger.setLevel(import.meta.env.DEV ? "debug" : "warn");

function MainLayout() {
  const dispatch = useAppDispatch();
  const errors = useAppSelector((state: RootState) => state.errorSlice.errors);
  const [showError, setShowError] = useState(false);
  const currentUser = useAppSelector((state) => state.sessionSlice.currentUser);
  const token = getTokenCookie();
  const wsData = useAppSelector((state) => state.socketSlice.data);

  useEffect(() => {
    if (token && !currentUser) {
      dispatch(getCurrentUser(token));
    }
  }, [dispatch, token, currentUser]);

  useEffect(() => {
    if (errors?.server_error) {
      setShowError(true);
      const timer = setTimeout(() => {
        setShowError(false);
        dispatch(clearError());
        dispatch(clearSessionStatus());
      }, 5000); // 5 seconds
      return () => clearTimeout(timer); // Cleanup timeout if component unmounts
    }
  }, [errors, dispatch]);

  useEffect(() => {
    logger.info("layout: ws data recieved ---> ", wsData);
    if (!wsData) return;
    const payload: BoardChannelPayloadInterface = JSON.parse(wsData.message);
    if (payload.message.event === "member_added") {
      dispatch(addBoardDirect(payload.message.board_data));
      dispatch(addBoardMemberDirect(payload.message.member_data));
    }
    if (payload.message.event === "member_removed") {
      dispatch(removeBoardDirect({ id: payload.message.board_id }));
      dispatch(removeBoardMemberDirect({ id: payload.message.member_id }));
    }
    if (payload.message.event === "board_removed") {
      dispatch(removeBoardDirect({ id: payload.message.board_data.id }));
      for (let member of payload.message.board_data.members) {
        dispatch(removeBoardMemberDirect({ id: member.id }));
      }
    }
    if (payload.message.event === "board_updated") {
      dispatch(updateBoardDirect(payload.message.board_data));
    }
    if (payload.message.event === "list_added") {
      dispatch(addListDirect(payload.message.list_data));
    }
    if (payload.message.event === "list_updated") {
      dispatch(updateListDirect(payload.message.list_data));
    }
    if (payload.message.event === "list_removed") {
      dispatch(removeListDirect({ id: payload.message.list_id }));
    }
    if (payload.message.event === "card_added") {
      dispatch(addCardDirect(payload.message.card_data));
    }
    if (payload.message.event === "card_updated") {
      dispatch(updateCardDirect(payload.message.card_data));
    }
    if (payload.message.event === "card_removed") {
      dispatch(
        removeCardDirect({
          id: payload.message.card_id,
          listId: payload.message.list_id,
        }),
      );
    }
  }, [wsData]);

  return (
    <div className="main-layout-component">
      <Header />
      {/* <FormSubmissionStatusModal /> */}
      <ServerErrorModal
        showError={showError}
        setShowError={setShowError}
        errors={errors}
      />
      <Outlet />
    </div>
  );
}

export default MainLayout;
