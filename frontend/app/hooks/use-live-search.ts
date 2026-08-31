import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "~/state/hooks";
import { searchUsers } from "~/state/searchSlice";

function useLiveSearch(query: string) {
  const dispatch = useAppDispatch();
  const searchResults = useAppSelector(
    (state) => state.search.userEmailSearchResults,
  );

  useEffect(() => {
    if (query.length < 3) return;
    dispatch(searchUsers({ query: query }))
      .unwrap()
      .catch((e) => console.log(e));
  }, [query]);

  return searchResults;
}

export default useLiveSearch;
