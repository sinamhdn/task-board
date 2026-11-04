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

  return (
    <ClickAwayListener onClickAway={handleCancelAddNewBoardClick}>
      <div className="board-add-form-component p-4 mt-4 bg-blue-800">
        <h4 className="text-center mt-4 mb-4 text-3xl">New Board</h4>
        <FormProvider {...methods}>
          <form
            className="signup-form xl:w-1/4 lg:w-1/2 sm:w-full mx-auto text-center"
            noValidate
            onSubmit={onSubmit}
          >
            <div className="grid gap-5">
              <Input {...board_name_validation} errors={errors} />
            </div>
            <div className="submit-button mt-5 mb-5">
              <button
                type="submit"
                className="flex items-center justify-center gap-1 p-5 mx-auto font-semibold w-48 text-center text-white bg-green-600 rounded-md hover:bg-green-800  cursor-pointer"
              >
                {createBoardLoadingStatus === LoadingStatusEnum.pending
                  ? "Adding board..."
                  : "Add board"}
              </button>
              {/* <button
                className="bg-red-600 hover:bg-red-800  mt-8 h-12 w-12 rounded-full cursor-pointer"
                onClick={handleCancelAddNewBoardClick}
              >
                X
              </button> */}
            </div>
          </form>
        </FormProvider>
      </div>
    </ClickAwayListener>
  );
}

export default BoardAddForm;
