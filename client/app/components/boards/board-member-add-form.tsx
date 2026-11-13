import { useEffect } from "react";
import ClickAwayListener from "react-click-away-listener";
import { FormProvider, useForm } from "react-hook-form";
import { Input } from "~/components/input";
import SearchResultModal from "~/components/search-result-modal";
import { useLiveSearch } from "~/hooks";
import { LoadingStatusEnum } from "~/state";
import { addBoardMember } from "~/state/boardMemberSlice";
import { clearError } from "~/state/errorSlice";
import { useAppDispatch, useAppSelector } from "~/state/hooks";
import { clearQuery, setQuery } from "~/state/searchSlice";
import type { RootState } from "~/state/store";
import { board_member_email_validation } from "~/utils/input/input-validations";

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
      <div
        className="add-new-member-form relative text-center
      w-full max-w-[min(22rem,calc(100vw-2rem))]
      bg-gray-100/30 dark:bg-gray-700/40 border border-white/40 dark:border-white/10
      shadow-[0_8px_32px_rgba(31,38,135,0.15)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.45)]
      ring-1 ring-inset ring-white/20 dark:ring-white/5
      transition-colors duration-300 backdrop-blur-md
      z-10 pt-3 pb-1"
      >
        <p>Add new member</p>
        <FormProvider {...methods}>
          <form
            className="board-member-add-form px-5 mx-auto text-center w-full"
            noValidate
            onSubmit={onSubmit}
          >
            <div className="member-add-form-inputs w-full">
              <Input {...board_member_email_validation} errors={errors} />
              <div className="search-result-modal relative w-full">
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
                className="flex items-center justify-center gap-1 px-4 mx-auto font-semibold text-center rounded-full
                  bg-emerald-500/80 hover:bg-emerald-500
                  dark:bg-emerald-400/70 dark:hover:bg-emerald-400/90
                  backdrop-blur-md
                  border border-white/30 dark:border-white/20
                  shadow-lg shadow-emerald-500/20
                  hover:shadow-emerald-500/40
                  transition-all duration-200
                  cursor-pointer
                  disabled:opacity-60 disabled:cursor-not-allowed"
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
