import { useEffect, useMemo, useState } from "react";
import { ArrowDownUp, Lightbulb, Search } from "lucide-react";
import AppLayout from "../components/AppLayout";
import { useAuth } from "../hooks/useAuth";
import { getIdeas, getUserIdeas, setIdeaInteraction } from "../services/api/ideas";
import { getErrorMessage } from "../services/api/client";

function DashboardPage({ initialFeed = "all", allowFeedToggle = true }) {
  const { user } = useAuth();
  const [ideas, setIdeas] = useState([]);
  const [rawIdeas, setRawIdeas] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [interactionLoading, setInteractionLoading] = useState({
    ideaId: null,
    state: null,
  });
  const [activeFeed, setActiveFeed] = useState(initialFeed);
  const [filters, setFilters] = useState({
    q: "",
    page: 1,
    limit: 15,
    sort: "desc",
  });

  const queryParams = useMemo(
    () => ({
      q: filters.q || undefined,
      page: filters.page,
      limit: filters.limit,
      sort: filters.sort,
    }),
    [filters],
  );

  useEffect(() => {
    if (!user) {
      setIdeas([]);
      setRawIdeas([]);
      setPagination(null);
      setErrorMessage("");
      setIsLoading(false);
      return;
    }

    let isActive = true;

    const fetchIdeas = async () => {
      try {
        setIsLoading(true);
        setErrorMessage("");
        const response =
          activeFeed === "mine"
            ? await getUserIdeas()
            : await getIdeas(queryParams);

        if (!isActive) {
          return;
        }

        const fetchedIdeas = response?.data?.ideas ?? [];
        setRawIdeas(fetchedIdeas);

        if (activeFeed === "mine") {
          setIdeas(fetchedIdeas);
          setPagination(null);
        } else {
          setIdeas(fetchedIdeas);
          setPagination(response?.meta?.pagination ?? null);
        }
      } catch (error) {
        if (!isActive) {
          return;
        }
        setErrorMessage(getErrorMessage(error, "Failed to load ideas."));
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    };

    fetchIdeas();

    return () => {
      isActive = false;
    };
  }, [activeFeed, queryParams, user]);

  useEffect(() => {
    if (activeFeed !== "mine") {
      return;
    }

    const normalizedQuery = filters.q.trim().toLowerCase();
    const filteredIdeas = rawIdeas.filter((idea) => {
      if (!normalizedQuery) {
        return true;
      }

      const title = (idea?.title || "").toLowerCase();
      const description = (idea?.description || "").toLowerCase();
      return (
        title.includes(normalizedQuery) || description.includes(normalizedQuery)
      );
    });

    const sortedIdeas = [...filteredIdeas].sort((left, right) => {
      const leftDate = left?.created_at ? new Date(left.created_at).getTime() : 0;
      const rightDate = right?.created_at ? new Date(right.created_at).getTime() : 0;

      return filters.sort === "asc" ? leftDate - rightDate : rightDate - leftDate;
    });

    const totalCount = sortedIdeas.length;
    const totalPages = Math.max(1, Math.ceil(totalCount / filters.limit));
    const currentPage = Math.min(filters.page, totalPages);
    const startIndex = (currentPage - 1) * filters.limit;
    const pagedIdeas = sortedIdeas.slice(startIndex, startIndex + filters.limit);

    setIdeas(pagedIdeas);
    setPagination({
      total_count: totalCount,
      page: currentPage,
      limit: filters.limit,
      total_pages: totalPages,
    });
  }, [activeFeed, filters, rawIdeas]);

  const handleSearchChange = (event) => {
    setFilters((prev) => ({
      ...prev,
      q: event.target.value,
      page: 1,
    }));
  };

  const handleLimitChange = (event) => {
    setFilters((prev) => ({
      ...prev,
      limit: Number(event.target.value),
      page: 1,
    }));
  };

  const handleSortChange = (event) => {
    setFilters((prev) => ({
      ...prev,
      sort: event.target.value,
      page: 1,
    }));
  };

  const handlePageChange = (nextPage) => {
    setFilters((prev) => ({
      ...prev,
      page: nextPage,
    }));
  };

  const handleFeedChange = (nextFeed) => {
    if (!allowFeedToggle) {
      return;
    }

    setActiveFeed(nextFeed);
    setFilters((prev) => ({
      ...prev,
      page: 1,
    }));
  };

  const handleInteraction = async (ideaId, state) => {
    setInteractionLoading({ ideaId, state });

    try {
      const response = await setIdeaInteraction(ideaId, state);
      const interaction = response?.data?.interaction;

      if (!interaction) {
        return;
      }

      setIdeas((prev) =>
        prev.map((idea) =>
          idea.id === ideaId
            ? {
                ...idea,
                user_vote: interaction.user_vote,
                upvotes_count: interaction.upvotes_count,
                downvotes_count: interaction.downvotes_count,
              }
            : idea,
        ),
      );
    } catch (error) {
      setErrorMessage(getErrorMessage(error, "Failed to update vote."));
    } finally {
      setInteractionLoading({ ideaId: null, state: null });
    }
  };

  const totalPages = pagination?.total_pages ?? 1;
  const page = pagination?.page ?? filters.page;
  const isMineFeed = activeFeed === "mine";

  return (
    <AppLayout>
      <section className="space-y-6">
        <div className="rounded-card border border-ui-border/50 bg-gradient-to-br from-surface-raised/95 to-surface-base/95 p-6 shadow-card-light dark:shadow-card-dark">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="mb-2 inline-flex items-center gap-2 text-3xl font-semibold text-content-primary">
                <Lightbulb size={22} className="text-warning" />
                {isMineFeed ? "My Ideas" : "Ideas"}
              </h1>
              <p className="text-sm text-content-tertiary">
                {isMineFeed
                  ? "Ideas you created."
                  : `Welcome back, ${user?.username || user?.email || "creator"}.`}
              </p>

              {allowFeedToggle ? (
                <div className="mt-4 inline-flex rounded-pill border border-ui-border bg-surface-base p-1">
                  <button
                    type="button"
                    onClick={() => handleFeedChange("all")}
                    className={`rounded-pill px-4 py-1.5 text-xs font-semibold transition ${
                      activeFeed === "all"
                        ? "bg-accent-400/20 text-accent-600 dark:text-accent-200"
                        : "text-content-tertiary hover:text-content-secondary"
                    }`}
                  >
                    All ideas
                  </button>
                  <button
                    type="button"
                    onClick={() => handleFeedChange("mine")}
                    className={`rounded-pill px-4 py-1.5 text-xs font-semibold transition ${
                      activeFeed === "mine"
                        ? "bg-success/15 text-success"
                        : "text-content-tertiary hover:text-content-secondary"
                    }`}
                  >
                    My ideas
                  </button>
                </div>
              ) : null}
            </div>

            <div className="flex w-full flex-wrap items-center gap-3 md:w-auto">
              <label className="relative flex-1 md:w-72">
                <span className="sr-only">Search ideas</span>
                <Search
                  size={16}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-content-tertiary"
                />
                <input
                  type="search"
                  value={filters.q}
                  onChange={handleSearchChange}
                  placeholder="Search ideas"
                  className="w-full rounded-card border border-ui-border bg-surface-base py-2.5 pl-9 pr-4 text-sm text-content-primary outline-none transition focus:border-accent-400"
                />
              </label>
              <div className="flex items-center gap-2">
                <ArrowDownUp size={16} className="text-content-tertiary" />
                <select
                  value={filters.sort}
                  onChange={handleSortChange}
                  className="rounded-card border border-ui-border bg-surface-base px-3 py-2 text-sm text-content-primary outline-none transition focus:border-accent-400"
                >
                  <option value="desc">Newest</option>
                  <option value="asc">Oldest</option>
                </select>
              </div>
              <select
                value={filters.limit}
                onChange={handleLimitChange}
                className="rounded-card border border-ui-border bg-surface-base px-3 py-2 text-sm text-content-primary outline-none transition focus:border-accent-400"
              >
                <option value={10}>10 / page</option>
                <option value={15}>15 / page</option>
                <option value={25}>25 / page</option>
              </select>
            </div>
          </div>
        </div>

        <div className="grid gap-4">
          {isLoading ? (
            <div className="rounded-card border border-ui-border/50 bg-surface-base/80 p-6 text-content-tertiary">
              Loading ideas...
            </div>
          ) : null}

          {errorMessage ? (
            <div className="rounded-card border border-danger/40 bg-danger/10 p-6 text-danger">
              {errorMessage}
            </div>
          ) : null}

          {!isLoading && !errorMessage && ideas.length === 0 ? (
            <div className="rounded-card border border-ui-border/50 bg-surface-base/80 p-6 text-content-tertiary">
              <p>
                {isMineFeed
                  ? "You have not created any ideas yet."
                  : "No ideas found. Try a different search."}
              </p>
            </div>
          ) : null}

          {ideas.map((idea) => (
            <article
              key={idea.id}
              className="rounded-card border border-ui-border/50 bg-gradient-to-br from-surface-raised/90 to-surface-base/90 p-6 shadow-card-light dark:shadow-card-dark"
            >
              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div>
                  <div className="mb-2 flex flex-wrap items-center gap-2 text-sm text-content-tertiary">
                    <span className="rounded-badge border border-accent-400/40 bg-accent-400/10 px-3 py-1 text-xs font-semibold text-accent-600 dark:text-accent-200">
                      {idea?.category?.name || "Uncategorized"}
                    </span>
                    <span className="rounded-badge border border-ui-border bg-surface-sunken/60 px-3 py-1 text-xs font-semibold text-content-primary">
                      {idea?.status || "available"}
                    </span>
                    <span className="text-xs">
                      {idea?.created_at ? new Date(idea.created_at).toLocaleString() : ""}
                    </span>
                  </div>
                  <h2 className="text-xl font-semibold text-content-primary">{idea.title}</h2>
                  <p className="mt-2 text-sm text-content-secondary">{idea.description}</p>
                </div>

                <div className="flex flex-col items-start gap-2 text-sm text-content-tertiary md:items-end">
                  <span className="text-xs text-content-tertiary">Author</span>
                  <span className="font-medium text-content-primary">
                    {idea?.user?.username || idea?.user?.email || "Unknown"}
                  </span>
                  {idea?.taken_by_user ? (
                    <span className="text-xs text-success">
                      Taken by {idea.taken_by_user.username || idea.taken_by_user.email}
                    </span>
                  ) : null}
                </div>
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-content-tertiary">
                <span>Upvotes: {idea?.upvotes_count ?? 0}</span>
                <span>Downvotes: {idea?.downvotes_count ?? 0}</span>
                <span className="text-xs text-content-tertiary">
                  Your vote: {idea?.user_vote || "neutral"}
                </span>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleInteraction(idea.id, "upvote")}
                    disabled={interactionLoading.ideaId === idea.id || isLoading}
                    className={`rounded-lg border px-3 py-1.5 text-xs font-semibold transition ${
                      idea?.user_vote === "upvote"
                        ? "border-success/70 bg-success/15 text-success"
                        : "border-ui-border text-content-primary"
                    } disabled:cursor-not-allowed disabled:opacity-60`}
                  >
                    Upvote
                  </button>
                  <button
                    type="button"
                    onClick={() => handleInteraction(idea.id, "downvote")}
                    disabled={interactionLoading.ideaId === idea.id || isLoading}
                    className={`rounded-lg border px-3 py-1.5 text-xs font-semibold transition ${
                      idea?.user_vote === "downvote"
                        ? "border-danger/70 bg-danger/15 text-danger"
                        : "border-ui-border text-content-primary"
                    } disabled:cursor-not-allowed disabled:opacity-60`}
                  >
                    Downvote
                  </button>
                  <button
                    type="button"
                    onClick={() => handleInteraction(idea.id, "neutral")}
                    disabled={interactionLoading.ideaId === idea.id || isLoading}
                    className={`rounded-lg border px-3 py-1.5 text-xs font-semibold transition ${
                      idea?.user_vote === "neutral"
                        ? "border-accent-400/70 bg-accent-400/15 text-accent-600 dark:text-accent-200"
                        : "border-ui-border text-content-primary"
                    } disabled:cursor-not-allowed disabled:opacity-60`}
                  >
                    Neutral
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>

        {pagination ? (
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-card border border-ui-border/50 bg-surface-base/80 px-4 py-3 text-sm text-content-tertiary">
            <span>
              Page {page} of {totalPages}
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handlePageChange(Math.max(1, page - 1))}
                disabled={page <= 1 || isLoading}
                className="rounded-lg border border-ui-border px-3 py-1.5 text-content-primary transition disabled:cursor-not-allowed disabled:opacity-50"
              >
                Prev
              </button>
              <button
                type="button"
                onClick={() => handlePageChange(Math.min(totalPages, page + 1))}
                disabled={page >= totalPages || isLoading}
                className="rounded-lg border border-ui-border px-3 py-1.5 text-content-primary transition disabled:cursor-not-allowed disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        ) : null}
      </section>
    </AppLayout>
  );
}

export default DashboardPage;
