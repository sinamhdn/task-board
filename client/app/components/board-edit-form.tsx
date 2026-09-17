import ClickAwayListener from "react-click-away-listener";
import { FormProvider, useForm } from "react-hook-form";
import {
  LoadingStatus as BoardLoadingStatusEnum,
  updateBoard,
} from "~/state/boardSlice";
import { clearError } from "~/state/errorSlice";
import { useAppDispatch, useAppSelector } from "~/state/hooks";
import type { RootState } from "~/state/store";
import { getToken } from "~/utils";
import { board_name_validation } from "~/utils/input/input-validations";
import { Input } from "./input";
import LoadingSpinner from "./loading-spinner";

interface FormValues {
  board_name: string;
  board_id: number;
}

function BoardEditForm({
  boardId,
  setEditFormActive,
}: {
  boardId: number;
  setEditFormActive: (arg0: boolean) => void;
}) {
  const errors = useAppSelector((error: RootState) => error.errors);
  const dispatch = useAppDispatch();
  const token = getToken();

  if (!token) return <LoadingSpinner />;

  const handleSubmitCallback = async (data: FormValues) => {
    setEditFormActive(false);
    try {
      const result = await dispatch(
        updateBoard({
          board_name: data.board_name,
          board_id: boardId,
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
      board_name: "",
    },
    mode: "onChange",
  });

  const onSubmit = methods.handleSubmit(handleSubmitCallback);

  return (
    <ClickAwayListener
      onClickAway={async () => {
        await onSubmit();
      }}
    >
      <div className="board-add-form-component p-4 mt-4 bg-blue-800">
        <FormProvider {...methods}>
          <form
            className="signup-form xl:w-1/4 lg:w-1/2 sm:w-full mx-auto text-center"
            noValidate
          >
            <div className="grid gap-5">
              <Input {...board_name_validation} errors={errors} />
            </div>
          </form>
        </FormProvider>
      </div>
    </ClickAwayListener>
  );
}

export default BoardEditForm;
