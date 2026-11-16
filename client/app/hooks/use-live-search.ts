import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "~/state/hooks";
import { searchUsers } from "~/state/search-slice";
import log from "~/utils/logger";

const logger = log.getLogger("use-live-search logger");
logger.setLevel(import.meta.env.DEV ? "debug" : "warn");

export function useLiveSearch(query: string) {
  const dispatch = useAppDispatch();
  const searchResults = useAppSelector(
    (state) => state.searchSlice.userEmailSearchResults,
  );

  useEffect(() => {
    if (query.length < 3) return;
    dispatch(searchUsers({ query: query }))
      .unwrap()
      .catch((e) =>
        logger.info(
          "use-live-search: dispatch error while searching a user ---> ",
          e,
        ),
      );
  }, [query]);

  return searchResults;
}

// export default useLiveSearch;
