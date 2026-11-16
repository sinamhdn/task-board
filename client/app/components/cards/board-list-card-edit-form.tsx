import ClickAwayListener from "react-click-away-listener";
import { FormProvider, useForm } from "react-hook-form";
import { Input } from "~/components/input";
import { updateCard } from "~/state/card-slice";
import { clearError } from "~/state/error-slice";
import { useAppDispatch, useAppSelector } from "~/state/hooks";
import type { RootState } from "~/state/store";
import { card_name_validation } from "~/utils/input/input-validations";
import log from "~/utils/logger";

const logger = log.getLogger("board-list-card-edit-form logger");
logger.setLevel(import.meta.env.DEV ? "debug" : "warn");

interface FormValues {
  card_id: number;
  card_name: string;
  board_id: number;
  list_id: number;
}

function BoardCardEditForm({
  token,
  cardId,
  cardName,
  listId,
  boardId,
  setEditFormActive,
}: {
  token: string | null;
  cardId: number;
  cardName: string;
  listId: number;
  boardId: number;
  setEditFormActive: (arg0: boolean) => void;
}) {
  const errors = useAppSelector((state: RootState) => state.errorSlice.errors);
  const dispatch = useAppDispatch();

  const handleSubmitCallback = async (data: FormValues) => {
    if (!token) return;
    try {
      const result = await dispatch(
        updateCard({
          cardId: cardId,
          cardName: data.card_name,
          boardId: boardId,
          listId: listId,
          token: token,
        }),
      ).unwrap();
      dispatch(clearError());
    } catch (err) {
      logger.error(
        "board-list-card-edit-form: dispatch error while updating a card ---> ",
        err,
      );
    }
  };

  const methods = useForm<FormValues>({
    defaultValues: {
      card_name: cardName,
    },
    mode: "onChange",
  });

  const onSubmit = methods.handleSubmit(handleSubmitCallback);

  return (
    <ClickAwayListener
      onClickAway={async () => {
        setEditFormActive(false);
        await onSubmit();
      }}
    >
      <div className="card-edit-form-component">
        <FormProvider {...methods}>
          <form
            className="card-edit-form text-center"
            onSubmit={onSubmit}
            noValidate
          >
            <div className="grid gap-5">
              <Input
                {...card_name_validation}
                errors={errors}
                classNameLableTW="hidden"
                multiline
              />
            </div>
          </form>
        </FormProvider>
      </div>
    </ClickAwayListener>
  );
}

export default BoardCardEditForm;
