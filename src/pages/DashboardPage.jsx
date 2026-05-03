import { useEffect, useMemo, useRef, useState } from "react";
import AuthLayout from "../components/AuthLayout";
import FormMessage from "../components/FormMessage";
import InputField from "../components/InputField";
import { ArrowDownUp, Lightbulb, Search } from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { getCategories } from "../services/api/categories";
import {
  createIdea,
  getIdeas,
  getUserIdeas,
  setIdeaInteraction,
} from "../services/api/ideas";
import { getErrorMessage, getValidationErrors } from "../services/api/client";

function DashboardPage({ initialFeed = "all", allowFeedToggle = true }) {
  const { user } = useAuth();
  const [ideas, setIdeas] = useState([]);
  const [rawIdeas, setRawIdeas] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [categories, setCategories] = useState([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(false);
  const [createMessage, setCreateMessage] = useState("");
  const [createMessageType, setCreateMessageType] = useState("success");
  const [createErrors, setCreateErrors] = useState({});
  const [isCreating, setIsCreating] = useState(false);
  const [interactionLoading, setInteractionLoading] = useState({
    ideaId: null,
    state: null,
  });
  const [formData, setFormData] = useState({
    category_id: "",
    title: "",
    description: "",
  });
  const [activeFeed, setActiveFeed] = useState(initialFeed);
  const [filters, setFilters] = useState({
    q: "",
    page: 1,
    limit: 15,
    sort: "desc",
  });
  const createFormRef = useRef(null);

  const queryParams = useMemo(() => {
    const params = {
      q: filters.q || undefined,
      page: filters.page,
      limit: filters.limit,
      sort: filters.sort,
    };

    return params;
  }, [filters]);

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
      const leftDate = left?.created_at
        ? new Date(left.created_at).getTime()
        : 0;
      const rightDate = right?.created_at
        ? new Date(right.created_at).getTime()
        : 0;
      return filters.sort === "asc"
        ? leftDate - rightDate
        : rightDate - leftDate;
    });

    const totalCount = sortedIdeas.length;
    const totalPages = Math.max(1, Math.ceil(totalCount / filters.limit));
    const currentPage = Math.min(filters.page, totalPages);
    const startIndex = (currentPage - 1) * filters.limit;
    const pagedIdeas = sortedIdeas.slice(
      startIndex,
      startIndex + filters.limit,
    );

    setIdeas(pagedIdeas);
    setPagination({
      total_count: totalCount,
      page: currentPage,
      limit: filters.limit,
      total_pages: totalPages,
    });
  }, [activeFeed, filters, rawIdeas]);

  useEffect(() => {
    if (!user) {
      setCategories([]);
      setCreateMessage("");
      setCreateMessageType("success");
      setIsLoadingCategories(false);
      return;
    }

    let isActive = true;

    const fetchCategories = async () => {
      try {
        setIsLoadingCategories(true);
        const response = await getCategories();
        if (!isActive) {
          return;
        }

        setCategories(response?.data?.categories ?? []);
      } catch (error) {
        if (!isActive) {
          return;
        }

        setCreateMessage(getErrorMessage(error, "Failed to load categories."));
        setCreateMessageType("error");
      } finally {
        if (isActive) {
          setIsLoadingCategories(false);
        }
      }
    };

    fetchCategories();

    return () => {
      isActive = false;
    };
  }, [user]);

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

  const handleFormChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCreateIdea = async (event) => {
    event.preventDefault();
    setIsCreating(true);
    setCreateMessage("");
    setCreateMessageType("success");
    setCreateErrors({});

    try {
      const payload = {
        category_id: formData.category_id ? Number(formData.category_id) : null,
        title: formData.title.trim(),
        description: formData.description.trim(),
      };
      const response = await createIdea(payload);
      const createdIdea = response?.data?.idea;

      if (createdIdea) {
        setRawIdeas((prev) => [createdIdea, ...prev]);
        if (activeFeed !== "mine") {
          setIdeas((prev) => [createdIdea, ...prev]);
        }
      }

      setFormData({
        category_id: "",
        title: "",
        description: "",
      });
      setCreateMessage("Idea created successfully.");
      setCreateMessageType("success");
    } catch (error) {
      setCreateMessage(getErrorMessage(error, "Failed to create idea."));
      setCreateMessageType("error");
      setCreateErrors(getValidationErrors(error));
    } finally {
      setIsCreating(false);
    }
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

  const handleScrollToCreate = () => {
    createFormRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  return (
    <AuthLayout>
      <section className="w-full max-w-5xl space-y-6">
        <div
          ref={createFormRef}
          className="rounded-2xl border border-slate-700/50 bg-gradient-to-br from-slate-900/95 to-slate-950/95 p-6 shadow-[0_20px_50px_rgba(0,0,0,0.55)]"
        >
          <div className="flex items-center gap-3 text-slate-100">
            <Lightbulb size={20} className="text-amber-300" />
            <h2 className="text-lg font-semibold">Create a new idea</h2>
          </div>
          <form className="mt-5 space-y-4" onSubmit={handleCreateIdea}>
            <div>
              <label
                htmlFor="category_id"
                className="mb-2 block text-sm text-slate-300"
              >
                Category
              </label>
              <select
                id="category_id"
                name="category_id"
                value={formData.category_id}
                onChange={handleFormChange}
                className={`w-full rounded-xl border bg-slate-900 px-3 py-3 text-sm text-slate-100 outline-none transition focus:border-blue-500 focus:bg-slate-800 focus:ring-2 focus:ring-blue-500/30 ${
                  createErrors.category_id
                    ? "border-red-400"
                    : "border-slate-700"
                }`}
                disabled={isLoadingCategories}
              >
                <option value="">
                  {isLoadingCategories
                    ? "Loading categories..."
                    : "Select a category"}
                </option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
              <p className="mt-1.5 min-h-[18px] text-xs text-red-400">
                {createErrors.category_id || ""}
              </p>
            </div>
            <InputField
              id="title"
              name="title"
              label="Title"
              value={formData.title}
              onChange={handleFormChange}
              placeholder="Add keyboard shortcuts"
              error={createErrors.title}
            />
            <div>
              <label
                htmlFor="description"
                className="mb-2 block text-sm text-slate-300"
              >
                Description
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleFormChange}
                placeholder="Allow quick navigation between sections with shortcuts."
                rows={4}
                className={`w-full rounded-xl border bg-slate-900 px-3 py-3 text-sm text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-blue-500 focus:bg-slate-800 focus:ring-2 focus:ring-blue-500/30 ${
                  createErrors.description
                    ? "border-red-400"
                    : "border-slate-700"
                }`}
              />
              <p className="mt-1.5 min-h-[18px] text-xs text-red-400">
                {createErrors.description || ""}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-4">
              <button
                type="submit"
                disabled={isCreating}
                className="inline-flex items-center justify-center rounded-lg border border-blue-500 bg-gradient-to-br from-blue-500 to-blue-600 px-5 py-2.5 text-sm font-semibold text-slate-50 transition hover:-translate-y-0.5 hover:shadow-glow disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isCreating ? "Creating..." : "Create idea"}
              </button>
              <FormMessage message={createMessage} type={createMessageType} />
            </div>
          </form>
        </div>

        <div className="rounded-2xl border border-slate-700/50 bg-gradient-to-br from-slate-900/95 to-slate-950/95 p-6 shadow-[0_20px_50px_rgba(0,0,0,0.55)]">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="mb-2 inline-flex items-center gap-2 text-2xl font-semibold text-slate-100">
                <Lightbulb size={22} className="text-amber-300" />
                {isMineFeed ? "My Ideas" : "Ideas Feed"}
              </h1>
              <p className="text-slate-300">
                {isMineFeed
                  ? "Only your submitted ideas show here."
                  : `Welcome back, ${user?.username || user?.email || "creator"}.`}
              </p>
              {allowFeedToggle ? (
                <div className="mt-4 inline-flex rounded-full border border-slate-700/60 bg-slate-900/60 p-1">
                  <button
                    type="button"
                    onClick={() => handleFeedChange("all")}
                    className={`rounded-full px-4 py-1.5 text-xs font-semibold transition ${
                      activeFeed === "all"
                        ? "bg-blue-500/20 text-blue-100"
                        : "text-slate-300 hover:text-slate-100"
                    }`}
                  >
                    All ideas
                  </button>
                  <button
                    type="button"
                    onClick={() => handleFeedChange("mine")}
                    className={`rounded-full px-4 py-1.5 text-xs font-semibold transition ${
                      activeFeed === "mine"
                        ? "bg-emerald-500/20 text-emerald-100"
                        : "text-slate-300 hover:text-slate-100"
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
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  type="search"
                  value={filters.q}
                  onChange={handleSearchChange}
                  placeholder="Search ideas"
                  className="w-full rounded-xl border border-slate-700/60 bg-slate-900/60 py-2.5 pl-9 pr-4 text-sm text-slate-100 outline-none transition focus:border-blue-500"
                />
              </label>
              <div className="flex items-center gap-2">
                <ArrowDownUp size={16} className="text-slate-400" />
                <select
                  value={filters.sort}
                  onChange={handleSortChange}
                  className="rounded-xl border border-slate-700/60 bg-slate-900/60 px-3 py-2 text-sm text-slate-100 outline-none transition focus:border-blue-500"
                >
                  <option value="desc">Newest</option>
                  <option value="asc">Oldest</option>
                </select>
              </div>
              <select
                value={filters.limit}
                onChange={handleLimitChange}
                className="rounded-xl border border-slate-700/60 bg-slate-900/60 px-3 py-2 text-sm text-slate-100 outline-none transition focus:border-blue-500"
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
            <div className="rounded-2xl border border-slate-700/50 bg-slate-900/70 p-6 text-slate-300">
              Loading ideas...
            </div>
          ) : null}
          {errorMessage ? (
            <div className="rounded-2xl border border-rose-500/40 bg-rose-500/10 p-6 text-rose-100">
              {errorMessage}
            </div>
          ) : null}
          {!isLoading && !errorMessage && ideas.length === 0 ? (
            <div className="rounded-2xl border border-slate-700/50 bg-slate-900/70 p-6 text-slate-300">
              <p>
                {isMineFeed
                  ? "You have not created any ideas yet."
                  : "No ideas found. Try a different search."}
              </p>
              {isMineFeed ? (
                <button
                  type="button"
                  onClick={handleScrollToCreate}
                  className="mt-4 inline-flex items-center justify-center rounded-lg border border-blue-500 bg-gradient-to-br from-blue-500 to-blue-600 px-4 py-2 text-xs font-semibold text-slate-50 transition hover:-translate-y-0.5 hover:shadow-glow"
                >
                  Create your first idea
                </button>
              ) : null}
            </div>
          ) : null}
          {ideas.map((idea) => (
            <article
              key={idea.id}
              className="rounded-2xl border border-slate-700/50 bg-gradient-to-br from-slate-900/85 to-slate-950/85 p-6 shadow-[0_16px_40px_rgba(0,0,0,0.45)]"
            >
              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div>
                  <div className="mb-2 flex flex-wrap items-center gap-2 text-sm text-slate-400">
                    <span className="rounded-full border border-blue-500/40 bg-blue-500/10 px-3 py-1 text-xs font-semibold text-blue-200">
                      {idea?.category?.name || "Uncategorized"}
                    </span>
                    <span className="rounded-full border border-slate-600/50 bg-slate-800/60 px-3 py-1 text-xs font-semibold text-slate-200">
                      {idea?.status || "available"}
                    </span>
                    <span className="text-xs">
                      {idea?.created_at
                        ? new Date(idea.created_at).toLocaleString()
                        : ""}
                    </span>
                  </div>
                  <h2 className="text-xl font-semibold text-slate-100">
                    {idea.title}
                  </h2>
                  <p className="mt-2 text-sm text-slate-300">
                    {idea.description}
                  </p>
                </div>
                <div className="flex flex-col items-start gap-2 text-sm text-slate-300 md:items-end">
                  <span className="text-xs text-slate-400">Author</span>
                  <span className="font-medium text-slate-200">
                    {idea?.user?.username || idea?.user?.email || "Unknown"}
                  </span>
                  {idea?.taken_by_user ? (
                    <span className="text-xs text-emerald-300">
                      Taken by{" "}
                      {idea.taken_by_user.username || idea.taken_by_user.email}
                    </span>
                  ) : null}
                </div>
              </div>
              <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-slate-300">
                <span>Upvotes: {idea?.upvotes_count ?? 0}</span>
                <span>Downvotes: {idea?.downvotes_count ?? 0}</span>
                <span className="text-xs text-slate-400">
                  Your vote: {idea?.user_vote || "neutral"}
                </span>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleInteraction(idea.id, "upvote")}
                    disabled={
                      interactionLoading.ideaId === idea.id || isLoading
                    }
                    className={`rounded-lg border px-3 py-1.5 text-xs font-semibold transition ${
                      idea?.user_vote === "upvote"
                        ? "border-emerald-400/70 bg-emerald-400/10 text-emerald-200"
                        : "border-slate-700/60 text-slate-200"
                    } disabled:cursor-not-allowed disabled:opacity-60`}
                  >
                    Upvote
                  </button>
                  <button
                    type="button"
                    onClick={() => handleInteraction(idea.id, "downvote")}
                    disabled={
                      interactionLoading.ideaId === idea.id || isLoading
                    }
                    className={`rounded-lg border px-3 py-1.5 text-xs font-semibold transition ${
                      idea?.user_vote === "downvote"
                        ? "border-rose-400/70 bg-rose-400/10 text-rose-200"
                        : "border-slate-700/60 text-slate-200"
                    } disabled:cursor-not-allowed disabled:opacity-60`}
                  >
                    Downvote
                  </button>
                  <button
                    type="button"
                    onClick={() => handleInteraction(idea.id, "neutral")}
                    disabled={
                      interactionLoading.ideaId === idea.id || isLoading
                    }
                    className={`rounded-lg border px-3 py-1.5 text-xs font-semibold transition ${
                      idea?.user_vote === "neutral"
                        ? "border-blue-400/70 bg-blue-400/10 text-blue-200"
                        : "border-slate-700/60 text-slate-200"
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
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-700/50 bg-slate-900/70 px-4 py-3 text-sm text-slate-300">
            <span>
              Page {page} of {totalPages}
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handlePageChange(Math.max(1, page - 1))}
                disabled={page <= 1 || isLoading}
                className="rounded-lg border border-slate-700/60 px-3 py-1.5 text-slate-200 transition disabled:cursor-not-allowed disabled:opacity-50"
              >
                Prev
              </button>
              <button
                type="button"
                onClick={() => handlePageChange(Math.min(totalPages, page + 1))}
                disabled={page >= totalPages || isLoading}
                className="rounded-lg border border-slate-700/60 px-3 py-1.5 text-slate-200 transition disabled:cursor-not-allowed disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        ) : null}
      </section>
    </AuthLayout>
  );
}

export default DashboardPage;
