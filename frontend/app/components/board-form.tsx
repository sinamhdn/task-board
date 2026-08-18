import { useForm, FormProvider } from "react-hook-form";
import { useNavigate } from "react-router";
import { createNewBoard } from "~/state/boardSlice";
import { useAppDispatch, useAppSelector } from "~/state/hooks";
import { getToken } from "~/utils";
import { clearError } from "~/state/errorSlice";
import { Input } from "./input";
import { LoadingStatus } from "~/state/boardSlice";
import { board_name_validation } from "~/utils/input/inputValidations";
import type { RootState } from "~/state/store";
import ClickAwayListener from "react-click-away-listener";

function BoardForm({ handleCancelClick }: { handleCancelClick: () => void }) {
  const token = getToken();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const loadingState = useAppSelector((state) => state.board.LoadingStatus);
  const errors = useAppSelector((error: RootState) => error.errors);

  interface FormValues {
    form_name: string;
  }

  if (!token) {
    navigate("/signin");
    throw "Please sign in";
  }

  const handleSubmitCallback = async (data: FormValues) => {
    try {
      const result = await dispatch(
        createNewBoard({
          name: data.form_name,
          token: token,
        }),
      ).unwrap();
      dispatch(clearError());
      navigate("/");
    } catch (err) {
      console.log(err);
    }
  };

  const methods = useForm<FormValues>({
    defaultValues: {
      form_name: "",
    },
    mode: "onChange",
  });

  const onSubmit = methods.handleSubmit(handleSubmitCallback);

  return (
    <ClickAwayListener onClickAway={handleCancelClick}>
      <div className="board-add-form-component">
        <h4>New Board</h4>
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
                className="flex items-center justify-center gap-1 p-5 mx-auto font-semibold w-48 text-center text-white bg-blue-600 rounded-md hover:bg-blue-800"
              >
                {loadingState === LoadingStatus.pending
                  ? "Adding board..."
                  : "Add board"}
              </button>
              <button onClick={handleCancelClick}>X</button>
            </div>
          </form>
        </FormProvider>
      </div>
    </ClickAwayListener>
  );
}

export default BoardForm;
