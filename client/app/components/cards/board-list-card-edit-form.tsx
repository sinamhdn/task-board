import ClickAwayListener from "react-click-away-listener";
import { FormProvider, useForm } from "react-hook-form";
import { Input } from "~/components/input";
import LoadingSpinner from "~/components/loading-spinner";
import { updateCard } from "~/state/cardSlice";
import { clearError } from "~/state/errorSlice";
import { useAppDispatch, useAppSelector } from "~/state/hooks";
import type { RootState } from "~/state/store";
import { getToken } from "~/utils";
import { card_name_validation } from "~/utils/input/input-validations";

interface FormValues {
  card_id: number;
  card_name: string;
  board_id: number;
  list_id: number;
}

function BoardCardEditForm({
  cardId,
  cardName,
  listId,
  boardId,
  setEditFormActive,
}: {
  cardId: number;
  cardName: string;
  listId: number;
  boardId: number;
  setEditFormActive: (arg0: boolean) => void;
}) {
  const errors = useAppSelector((state: RootState) => state.errorSlice.errors);
  const dispatch = useAppDispatch();
  const token = getToken();

  if (!token) return <LoadingSpinner />;

  const handleSubmitCallback = async (data: FormValues) => {
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
      console.log(err);
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
              />
            </div>
          </form>
        </FormProvider>
      </div>
    </ClickAwayListener>
  );
}

export default BoardCardEditForm;
