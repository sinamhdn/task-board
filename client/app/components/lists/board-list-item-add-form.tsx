import ClickAwayListener from "react-click-away-listener";
import { FormProvider, useForm } from "react-hook-form";
import { Input } from "~/components/input";
import { LoadingStatusEnum } from "~/state";
import { clearError } from "~/state/errorSlice";
import { useAppDispatch, useAppSelector } from "~/state/hooks";
import { createNewList } from "~/state/listSlice";
import type { RootState } from "~/state/store";
import { board_list_name_validation } from "~/utils/input/input-validations";

function BoardListAddForm({
  board_id,
  token,
  handleCancelCreateNewListClick,
}: {
  board_id: number;
  token: string;
  handleCancelCreateNewListClick: () => void;
}) {
  const createNewListLoadingStatus = useAppSelector(
    (state) => state.listSlice.createNewListLoadingStatus,
  );
  const errors = useAppSelector((state: RootState) => state.errorSlice.errors);
  const dispatch = useAppDispatch();

  const methods = useForm<{ list_name: string }>({
    defaultValues: {
      list_name: "",
    },
    mode: "onChange",
  });

  const handleSubmitCallback = async (data: { list_name: string }) => {
    try {
      const result = await dispatch(
        createNewList({
          listName: data.list_name,
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
    <ClickAwayListener onClickAway={handleCancelCreateNewListClick}>
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
                {createNewListLoadingStatus === LoadingStatusEnum.pending
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

export default BoardListAddForm;
