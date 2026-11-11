import ClickAwayListener from "react-click-away-listener";
import { FormProvider, useForm } from "react-hook-form";
import { Input } from "~/components/input";
import { LoadingStatusEnum } from "~/state";
import { createNewCard } from "~/state/cardSlice";
import { clearError } from "~/state/errorSlice";
import { useAppDispatch, useAppSelector } from "~/state/hooks";
import type { RootState } from "~/state/store";
import { board_card_name_validation } from "~/utils/input/input-validations";

function BoardCardAddForm({
  boardId,
  listId,
  token,
  handleCancelAddNewCardClick,
}: {
  boardId: number;
  listId: number;
  token: string;
  handleCancelAddNewCardClick: () => void;
}) {
  const createNewCardLoadingStatus = useAppSelector(
    (state) => state.cardSlice.createNewCardLoadingStatus,
  );
  const errors = useAppSelector((state: RootState) => state.errorSlice.errors);
  const dispatch = useAppDispatch();

  const methods = useForm<{ card_name: string }>({
    defaultValues: {
      card_name: "",
    },
    mode: "onChange",
  });

  const handleSubmitCallback = async (data: { card_name: string }) => {
    handleCancelAddNewCardClick();
    try {
      const result = await dispatch(
        createNewCard({
          cardName: data.card_name,
          boardId: boardId,
          listId: listId,
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
    <ClickAwayListener onClickAway={handleCancelAddNewCardClick}>
      <div
        className="add-new-card-form text-center z-10 bg-gray-100/30 dark:bg-gray-700/40 border border-white/40 dark:border-white/10 shadow-[0_8px_32px_rgba(31,38,135,0.15)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.45)]
          ring-1 ring-inset ring-white/20 dark:ring-white/5
          transition-colors duration-300 w-full backdrop-blur-md relative bottom-0"
      >
        <p>ADD NEW CARD</p>
        <FormProvider {...methods}>
          <form
            className="board-card-add-form pl-5 pr-5 mx-auto text-center"
            noValidate
            onSubmit={onSubmit}
          >
            <div className="card-add-form-inputs">
              <Input
                {...board_card_name_validation}
                errors={errors}
                multiline={true}
              />
            </div>
            <div className="submit-button mt-5 mb-5">
              <button
                type="submit"
                className="flex items-center justify-center gap-1 mx-auto font-semibold text-center dark:text-white text-black cursor-pointer"
              >
                {createNewCardLoadingStatus === LoadingStatusEnum.pending
                  ? "Adding..."
                  : "Add card"}
              </button>
            </div>
          </form>
        </FormProvider>
      </div>
    </ClickAwayListener>
  );
}

export default BoardCardAddForm;
