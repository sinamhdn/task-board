import ClickAwayListener from "react-click-away-listener";
import { FormProvider, useForm } from "react-hook-form";
import { LoadingStatusEnum } from "~/state";
import { addBoardMember } from "~/state/boardMemberSlice";
import { clearError } from "~/state/errorSlice";
import { useAppDispatch, useAppSelector } from "~/state/hooks";
import type { RootState } from "~/state/store";
import { board_list_name_validation } from "~/utils/input/input-validations";
import { Input } from "./input";

function BoardMemberAddForm({
  board_id,
  token,
  handleCancelAddNewBoardClick,
}: {
  board_id: number;
  token: string;
  handleCancelAddNewBoardClick: () => void;
}) {
  const addBoardMemberLoadingStatus = useAppSelector(
    (state) => state.boardMemberSlice.addBoardMemberLoadingStatus,
  );
  const errors = useAppSelector((state: RootState) => state.errorSlice.errors);
  const dispatch = useAppDispatch();

  const methods = useForm<{ board_member_email: string }>({
    defaultValues: {
      board_member_email: "",
    },
    mode: "onChange",
  });

  const handleSubmitCallback = async (data: { board_member_email: string }) => {
    try {
      const result = await dispatch(
        addBoardMember({
          boardMemberEmail: data.board_member_email,
          boardId: board_id,
          token: token,
        }),
      ).unwrap();
      dispatch(clearError());
    } catch (err) {
      console.log(err);
    }
  };

  const onSubmit = methods.handleSubmit(handleSubmitCallback);

  return (
    <ClickAwayListener onClickAway={handleCancelAddNewBoardClick}>
      <div className="add-new-list-form absolute text-center bg-gray-300 dark:bg-gray-700 w-100">
        <p>ADD NEW LIST</p>
        <FormProvider {...methods}>
          <form
            className="board-list-add-form pl-5 pr-5 mx-auto text-center"
            noValidate
            onSubmit={onSubmit}
          >
            <div className="list-add-form-inputs">
              <Input {...board_list_name_validation} errors={errors} />
            </div>
            <div className="submit-button mt-5 mb-5">
              <button
                type="submit"
                className="flex items-center justify-center gap-1 mx-auto font-semibold text-center dark:text-white text-black"
              >
                {addBoardMemberLoadingStatus === LoadingStatusEnum.pending
                  ? "Adding..."
                  : "Add list"}
              </button>
            </div>
          </form>
        </FormProvider>
      </div>
    </ClickAwayListener>
  );
}

export default BoardMemberAddForm;
