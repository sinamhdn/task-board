import ClickAwayListener from "react-click-away-listener";
import { FormProvider, useForm } from "react-hook-form";
import { Input } from "~/components/input";
import LoadingSpinner from "~/components/loading-spinner";
import { updateBoard } from "~/state/boardSlice";
import { clearError } from "~/state/errorSlice";
import { useAppDispatch, useAppSelector } from "~/state/hooks";
import type { RootState } from "~/state/store";
import { getToken } from "~/utils";
import { board_name_validation } from "~/utils/input/input-validations";

interface FormValues {
  board_name: string;
  board_id: number;
}

function BoardEditForm({
  boardId,
  boardName,
  setEditFormActive,
}: {
  boardId: number;
  boardName: string;
  setEditFormActive: (arg0: boolean) => void;
}) {
  const errors = useAppSelector((state: RootState) => state.errorSlice.errors);
  const dispatch = useAppDispatch();
  const token = getToken();

  if (!token) return <LoadingSpinner />;

  const handleSubmitCallback = async (data: FormValues) => {
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
      console.log(err);
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
