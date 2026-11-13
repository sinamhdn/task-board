import { useEffect, useRef, useState } from "react";
import ClickAwayListener from "react-click-away-listener";
import { FormProvider, useForm } from "react-hook-form";
import { useAddNewBoardForm } from "~/providers/board-add-provider";
import { LoadingStatusEnum } from "~/state";
import { createNewBoard } from "~/state/boardSlice";
import { clearError } from "~/state/errorSlice";
import { useAppDispatch, useAppSelector } from "~/state/hooks";
import type { RootState } from "~/state/store";
import { getToken } from "~/utils";
import { board_name_validation } from "~/utils/input/input-validations";
import { Input } from "../input";
import LoadingSpinner from "../loading-spinner";

interface FormValues {
  board_name: string;
}

function BoardAddForm() {
  const openedAt = useRef(Date.now());
  const createBoardLoadingStatus = useAppSelector(
    (state) => state.boardSlice.createNewBoardLoadingStatus,
  );
  const errors = useAppSelector((error: RootState) => error.errorSlice.errors);
  const dispatch = useAppDispatch();
  const { handleCancelAddNewBoardClick } = useAddNewBoardForm();
  const token = getToken();

  if (!token) return <LoadingSpinner />;

  const handleSubmitCallback = async (data: FormValues) => {
    try {
      const result = await dispatch(
        createNewBoard({
          boardName: data.board_name,
          token: token,
        }),
      ).unwrap();
      dispatch(clearError());
      handleCancelAddNewBoardClick();
    } catch (err) {
      console.log(err);
    }
  };

  const methods = useForm<FormValues>({
    defaultValues: {
      board_name: "",
    },
    mode: "onChange",
  });

  const onSubmit = methods.handleSubmit(handleSubmitCallback);

  const handleClickAway = () => {
    // Ignore any pointer event that lands within 300ms of mount.
    // Mobile browsers dispatch synthetic mouse events for a tap
    // up to ~300ms after touchend; this swallows all of them.
    if (Date.now() - openedAt.current < 300) return;
    handleCancelAddNewBoardClick();
  };

  return (
    <ClickAwayListener onClickAway={handleClickAway} mouseEvent="mousedown">
      {/* Glass panel */}
      <div
        className="
          board-add-form-component relative p-6
          backdrop-blur-sm
          bg-gray-100/30 dark:bg-gray-700/40
          border border-white/40 dark:border-white/10
          shadow-[0_8px_32px_rgba(31,38,135,0.15)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.45)]
          ring-1 ring-inset ring-white/20 dark:ring-white/5
          transition-colors duration-300
        "
      >
        {/* Soft top highlight for the glass shine */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/70 to-transparent dark:via-white/20"
        />

        <h4 className="text-center mt-2 mb-6 text-3xl font-semibold tracking-tight text-gray-800 dark:text-gray-100">
          New Board
        </h4>

        <FormProvider {...methods}>
          <form
            className="board-add-form xl:w-1/4 lg:w-1/2 w-full mx-auto text-center z-10"
            noValidate
            onSubmit={onSubmit}
          >
            <div className="grid gap-5">
              <Input {...board_name_validation} errors={errors} />
            </div>

            <div className="submit-button mt-6 mb-2">
              <button
                type="submit"
                className="
                  flex items-center justify-center gap-2
                  p-1 mx-auto w-48 font-semibold text-center rounded-full
                  bg-emerald-500/80 hover:bg-emerald-500
                  dark:bg-emerald-400/70 dark:hover:bg-emerald-400/90
                  backdrop-blur-md
                  border border-white/30 dark:border-white/20
                  shadow-lg shadow-emerald-500/20
                  hover:shadow-emerald-500/40
                  transition-all duration-200
                  cursor-pointer
                  disabled:opacity-60 disabled:cursor-not-allowed
                "
                disabled={
                  createBoardLoadingStatus === LoadingStatusEnum.pending
                }
              >
                {createBoardLoadingStatus === LoadingStatusEnum.pending
                  ? "Adding board..."
                  : "Add board"}
              </button>
            </div>
          </form>
        </FormProvider>
      </div>
    </ClickAwayListener>
  );
}

export default BoardAddForm;
