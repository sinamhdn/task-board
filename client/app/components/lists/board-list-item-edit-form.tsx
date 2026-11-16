import ClickAwayListener from "react-click-away-listener";
import { FormProvider, useForm } from "react-hook-form";
import { Input } from "~/components/input";
import LoadingSpinner from "~/components/loading-spinner";
import { clearError } from "~/state/error-slice";
import { useAppDispatch, useAppSelector } from "~/state/hooks";
import { updateList } from "~/state/list-slice";
import type { RootState } from "~/state/store";
import { list_name_validation } from "~/utils/input/input-validations";
import log from "~/utils/logger";

const logger = log.getLogger("board-list-item-edit-form logger");
logger.setLevel(import.meta.env.DEV ? "debug" : "warn");

interface FormValues {
  list_id: number;
  list_name: string;
  board_id: number;
}

function BoardListEditForm({
  token,
  listId,
  listName,
  boardId,
  setEditFormActive,
}: {
  token: string;
  listId: number;
  listName: string;
  boardId: number;
  setEditFormActive: (arg0: boolean) => void;
}) {
  const errors = useAppSelector((state: RootState) => state.errorSlice.errors);
  const dispatch = useAppDispatch();

  if (!token) return <LoadingSpinner />;

  const handleSubmitCallback = async (data: FormValues) => {
    try {
      const result = await dispatch(
        updateList({
          listId: listId,
          listName: data.list_name,
          boardId: boardId,
          token: token,
        }),
      ).unwrap();
      dispatch(clearError());
    } catch (err) {
      logger.error(
        "board-list-item-edit-form: dispatch error while updating a list ---> ",
        err,
      );
    }
  };

  const methods = useForm<FormValues>({
    defaultValues: {
      list_name: listName,
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
      <div className="list-edit-form-component">
        <FormProvider {...methods}>
          <form
            className="list-edit-form text-center"
            onSubmit={onSubmit}
            noValidate
          >
            <div className="grid gap-5">
              <Input
                {...list_name_validation}
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

export default BoardListEditForm;
