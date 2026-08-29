import ClickAwayListener from "react-click-away-listener";
import { FormProvider, useForm } from "react-hook-form";
import { Input } from "./input";
import { useAppDispatch, useAppSelector } from "~/state/hooks";
import type { RootState } from "~/state/store";
import { board_member_email_validation } from "~/utils/input/input-validations";
import { addBoardMember, LoadingStatus } from "~/state/boardSlice";
import { clearError } from "~/state/errorSlice";

function BoardMemberAddForm({
  board_id,
  token,
  handleCancelAddNewBoardClick,
}: {
  board_id: number;
  token: string;
  handleCancelAddNewBoardClick: () => void;
}) {
  const dispatch = useAppDispatch();
  const errors = useAppSelector((state: RootState) => state.errors);
  const addBoardMemberLoadingStatus = useAppSelector(
    (state) => state.board.addBoardMemberLoadingStatus,
  );

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
          board_member_email: data.board_member_email,
          board_id: board_id,
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
      <div className="add-new-member-form absolute text-center">
        <p>ADD NEW MEMBER FORM</p>
        <FormProvider {...methods}>
          <form
            className="signup-form xl:w-1/4 lg:w-1/2 sm:w-full mx-auto text-center"
            noValidate
            onSubmit={onSubmit}
          >
            <Input {...board_member_email_validation} errors={errors} />
            <div className="submit-button mt-5 mb-5">
              <button
                type="submit"
                className="flex items-center justify-center gap-1 p-5 mx-auto font-semibold w-48 text-center text-white bg-blue-600 rounded-md hover:bg-blue-800"
              >
                {addBoardMemberLoadingStatus === LoadingStatus.pending
                  ? "Adding..."
                  : "Add member"}
              </button>
            </div>
          </form>
        </FormProvider>
      </div>
    </ClickAwayListener>
  );
}

export default BoardMemberAddForm;
