import { useEffect, useState } from "react";
import { Outlet } from "react-router";
import type { BoardChannelPayloadInterface } from "~/state";
import {
  addBoardDirect,
  removeBoardDirect,
  updateBoardDirect,
} from "~/state/boardSlice";
import { clearError } from "~/state/errorSlice";
import { useAppDispatch, useAppSelector } from "~/state/hooks";
import { clearSessionStatus } from "~/state/sessionSlice";
import { getCurrentUser } from "~/state/sessionSlice.ts";
import type { RootState } from "~/state/store";
import { getToken } from "~/utils/auth";
import FormSubmissionStatusModal from "./form-submission-status-modal";
import Header from "./header";
import ServerErrorModal from "./server-error-modal";

function MainLayout() {
  const dispatch = useAppDispatch();
  const errors = useAppSelector((state: RootState) => state.errorSlice.errors);
  const [showError, setShowError] = useState(false);
  const currentUser = useAppSelector((state) => state.sessionSlice.currentUser);
  const token = getToken();
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
    if (!wsData) return;
    const payload: BoardChannelPayloadInterface = JSON.parse(wsData.message);
    if (payload.message.event === "member_added")
      dispatch(addBoardDirect(payload.message.data));
    if (
      payload.message.event === "member_removed" ||
      payload.message.event === "board_removed"
    )
      dispatch(removeBoardDirect(payload.message.data));
    if (payload.message.event === "board_updated")
      dispatch(updateBoardDirect(payload.message.data));
    console.log(`WSDATA CONTENT ${JSON.stringify(wsData)}`);
  }, [wsData]);

  return (
    <div className="main-layout-component">
      <Header />
      <FormSubmissionStatusModal />
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
