import ClickAwayListener from "react-click-away-listener";
import { FormProvider, useForm } from "react-hook-form";
import { Input } from "~/components/input";
import { updateBoard } from "~/state/board-slice";
import { clearError } from "~/state/error-slice";
import { useAppDispatch, useAppSelector } from "~/state/hooks";
import type { RootState } from "~/state/store";
import { board_name_validation } from "~/utils/input/input-validations";
import log from "~/utils/logger";

const logger = log.getLogger("board-edit-form logger");
logger.setLevel(import.meta.env.DEV ? "debug" : "warn");

interface FormValues {
  board_name: string;
  board_id: number;
}

function BoardEditForm({
  token,
  boardId,
  boardName,
  setEditFormActive,
}: {
  token: string | null;
  boardId: number;
  boardName: string;
  setEditFormActive: (arg0: boolean) => void;
}) {
  const errors = useAppSelector((state: RootState) => state.errorSlice.errors);
  const dispatch = useAppDispatch();

  const handleSubmitCallback = async (data: FormValues) => {
    if (!token) return;

    try {
      const result = await dispatch(
        updateBoard({
          boardName: data.board_name,
          boardId: boardId,
          token: token,
        }),
      ).unwrap();
      dispatch(clearError());
    } catch (err) {
      logger.error(
        "board-edit-form: dispatch error while updating a board ---> ",
        err,
      );
    }
  };

  const methods = useForm<FormValues>({
    defaultValues: {
      board_name: boardName,
    },
    mode: "onChange",
  });

  const onSubmit = methods.handleSubmit(handleSubmitCallback);

  return (
    <ClickAwayListener
      onClickAway={async () => {
        const ok = await methods.trigger(); // validate first
        if (ok) {
          await onSubmit();
        }
        setEditFormActive(false);
      }}
    >
      <div
        className="board-edit-form-component m-auto z-20"
        onClick={(e) => e.stopPropagation()}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <FormProvider {...methods}>
          <form
            className="board-edit-form text-center"
            onSubmit={onSubmit}
            noValidate
          >
            <div className="grid gap-5 text-center">
              <Input
                {...board_name_validation}
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

export default BoardEditForm;
