import { useEffect } from "react";
import { useAppDispatch } from "~/state/hooks";
import {
  clearQuery,
  type RecievedSearchUsersInterface,
} from "~/state/searchSlice";

function SearchResultModal({
  searchResults,
  handleSearchResultSelection,
}: {
  searchResults: RecievedSearchUsersInterface[];
  handleSearchResultSelection: (value: string) => void;
}) {
  const dispatch = useAppDispatch();

  useEffect(() => {
    return () => {
      dispatch(clearQuery());
    };
  }, [dispatch]);

  return (
    <div className="search-results">
      <ul>
        {searchResults.map((result) => (
          <li key={result.id}>
            <button
              type="button"
              className="w-full text-left p-2 hover:bg-gray-100"
              onClick={() => handleSearchResultSelection(result.email)}
            >
              {result.email}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default SearchResultModal;
