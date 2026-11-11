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
    handleCancelCreateNewListClick();
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
      <div
        className="add-new-list-form absolute inset-0 -top-1/8 md:-top-1/4 p-2 h-46 m-auto z-10 text-center bg-gray-100/30 dark:bg-gray-700/40 border border-white/40 dark:border-white/10 shadow-[0_8px_32px_rgba(31,38,135,0.15)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.45)]
          ring-1 ring-inset ring-white/20 dark:ring-white/5
          transition-colors duration-300 w-full md:w-1/2 backdrop-blur-md"
      >
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
                className="flex items-center justify-center gap-1 mx-auto font-semibold text-center dark:text-gray-100 text-gray-700 cursor-pointer"
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
