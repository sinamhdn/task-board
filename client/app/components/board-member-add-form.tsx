import { useEffect } from "react";
import ClickAwayListener from "react-click-away-listener";
import { FormProvider, useForm } from "react-hook-form";
import { useLiveSearch } from "~/hooks";
import { LoadingStatusEnum } from "~/state";
import { addBoardMember } from "~/state/boardMemberSlice";
import { clearError } from "~/state/errorSlice";
import { useAppDispatch, useAppSelector } from "~/state/hooks";
import { clearQuery, setQuery } from "~/state/searchSlice";
import type { RootState } from "~/state/store";
import { board_member_email_validation } from "~/utils/input/input-validations";
import { Input } from "./input";
import SearchResultModal from "./search-result-modal";

function BoardMemberAddForm({
  board_id,
  token,
  handleCancelAddNewBoardClick,
}: {
  board_id: number;
  token: string;
  handleCancelAddNewBoardClick: () => void;
}) {
  const addBoardMemberLoadingStatus = useAppSelector(
    (state) => state.boardMemberSlice.addBoardMemberLoadingStatus,
  );
  const errors = useAppSelector((state: RootState) => state.errorSlice.errors);
  const dispatch = useAppDispatch();

  const methods = useForm<{ board_member_email: string }>({
    defaultValues: {
      board_member_email: "",
    },
    mode: "onChange",
  });

  const watchedEmail = methods.watch("board_member_email");
  const searchResults = useLiveSearch(watchedEmail);

  useEffect(() => {
    if (watchedEmail) {
      dispatch(setQuery(watchedEmail));
    }
  }, [watchedEmail]);

  const handleSearchResultSelection = (value: string) => {
    dispatch(clearQuery());
    methods.setValue("board_member_email", value, {
      shouldValidate: true, // trigger validation
      shouldDirty: true, // mark field as dirty
      shouldTouch: true, // mark field as touched
    });
  };

  const handleSubmitCallback = async (data: { board_member_email: string }) => {
    try {
      const result = await dispatch(
        addBoardMember({
          boardMemberEmail: data.board_member_email,
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
    <ClickAwayListener onClickAway={handleCancelAddNewBoardClick}>
      <div className="add-new-member-form absolute text-center bg-gray-300 dark:bg-gray-700 w-100">
        <p>ADD NEW MEMBER FORM</p>
        <FormProvider {...methods}>
          <form
            className="board-member-add-form pl-5 pr-5 mx-auto text-center"
            noValidate
            onSubmit={onSubmit}
          >
            <div className="member-add-form-inputs">
              <Input {...board_member_email_validation} errors={errors} />
              <div className="search-result-modal">
                <SearchResultModal
                  searchResults={searchResults}
                  handleSearchResultSelection={(value: string) =>
                    handleSearchResultSelection(value)
                  }
                />
              </div>
            </div>
            <div className="submit-button mt-5 mb-5">
              <button
                type="submit"
                className="flex items-center justify-center gap-1 mx-auto font-semibold text-center dark:text-white text-black"
              >
                {addBoardMemberLoadingStatus === LoadingStatusEnum.pending
                  ? "Adding..."
                  : "Add member"}
              </button>
            </div>
          </form>
        </FormProvider>
      </div>
    </ClickAwayListener>
  );
}

export default BoardMemberAddForm;
