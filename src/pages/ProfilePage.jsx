import { useEffect, useMemo, useState } from "react";
import AppLayout from "../components/AppLayout";
import FormMessage from "../components/FormMessage";
import { useAuth } from "../hooks/useAuth";
import { getErrorMessage, getValidationErrors } from "../services/api/client";
import { updateCurrentUser } from "../services/api/auth";
import { getDeveloperIdeas, getUserIdeas } from "../services/api/ideas";
import { getMyComments } from "../services/api/comments";
import { getAvatarData } from "../utils/avatar";
import { formatIdeaStatus } from "../utils/ideaStatus";
import { getPrimaryRole, isDeveloper } from "../utils/userRoles";
import MyCommentCard from "../components/MyCommentCard";

function ProfilePage() {
  const { user, refreshUser } = useAuth();
  const [isEditMode, setIsEditMode] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
  });
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("success");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState("ideas");

  const [myIdeas, setMyIdeas] = useState([]);
  const [currentlyWorkingIdeas, setCurrentlyWorkingIdeas] = useState([]);
  const [completedIdeas, setCompletedIdeas] = useState([]);
  const [ideasError, setIdeasError] = useState("");
  const [isLoadingIdeas, setIsLoadingIdeas] = useState(false);

  const [myComments, setMyComments] = useState([]);
  const [commentsPage, setCommentsPage] = useState(1);
  const [commentsPagination, setCommentsPagination] = useState(null);
  const [isLoadingComments, setIsLoadingComments] = useState(false);
  const [commentsError, setCommentsError] = useState("");

  const isDeveloperUser = useMemo(() => isDeveloper(user), [user]);

  const displayName = useMemo(
    () => user?.username || user?.email || "User",
    [user],
  );
  const avatar = useMemo(() => getAvatarData(displayName), [displayName]);
  const registeredAt = useMemo(() => {
    if (!user?.created_at) {
      return "Unknown";
    }
    return new Date(user.created_at).toLocaleString();
  }, [user]);

  useEffect(() => {
    if (!user) {
      return;
    }

    setFormData({
      username: user.username || "",
      email: user.email || "",
    });
  }, [user]);

  useEffect(() => {
    if (!user || activeTab !== "ideas") {
      return;
    }

    let isActive = true;

    const fetchIdeas = async () => {
      try {
        setIsLoadingIdeas(true);
        setIdeasError("");
        const [myIdeasResponse, developerIdeasResponse] = await Promise.all([
          getUserIdeas(),
          isDeveloperUser ? getDeveloperIdeas() : Promise.resolve(null),
        ]);

        if (!isActive) {
          return;
        }

        setMyIdeas(myIdeasResponse?.data?.ideas ?? []);
        setCurrentlyWorkingIdeas(
          developerIdeasResponse?.data?.currently_working_on ?? [],
        );
        setCompletedIdeas(developerIdeasResponse?.data?.completed_ideas ?? []);
      } catch (error) {
        if (!isActive) {
          return;
        }
        setIdeasError(getErrorMessage(error, "Failed to load your ideas."));
      } finally {
        if (isActive) {
          setIsLoadingIdeas(false);
        }
      }
    };

    fetchIdeas();

    return () => {
      isActive = false;
    };
  }, [activeTab, isDeveloperUser, user]);

  useEffect(() => {
    if (!user || activeTab !== "comments") {
      return;
    }

    let isActive = true;

    const fetchComments = async () => {
      try {
        setIsLoadingComments(true);
        setCommentsError("");
        const response = await getMyComments({ page: commentsPage, limit: 10 });

        if (!isActive) return;

        setMyComments(response?.data?.comments ?? []);
        setCommentsPagination(response?.meta?.pagination ?? null);
      } catch (error) {
        if (!isActive) return;
        setCommentsError(getErrorMessage(error, "Failed to load your comments."));
      } finally {
        if (isActive) setIsLoadingComments(false);
      }
    };

    fetchComments();

    return () => { isActive = false; };
  }, [activeTab, commentsPage, user]);

  const renderIdeaCollection = (items, emptyMessage) => (
    <div className="space-y-3">
      {items.length === 0 ? (
        <div className="rounded-card border border-ui-border bg-surface-base p-4 text-sm text-content-tertiary">
          {emptyMessage}
        </div>
      ) : null}

      {items.map((idea) => (
        <article
          key={idea.id}
          className="rounded-card border border-ui-border/70 bg-surface-base p-4"
        >
          <div className="mb-1 flex flex-wrap items-center gap-2">
            <span className="rounded-badge border border-accent-400/40 bg-accent-400/10 px-3 py-1 text-xs font-semibold text-accent-600 dark:text-accent-200">
              {idea?.category?.name || "Uncategorized"}
            </span>
            <span className="rounded-badge border border-ui-border bg-surface-sunken/70 px-3 py-1 text-xs font-semibold text-content-primary">
              {formatIdeaStatus(idea?.status)}
            </span>
          </div>
          <h3 className="text-base font-semibold text-content-primary">{idea.title}</h3>
          <p className="mt-1 text-sm text-content-tertiary">{idea.description}</p>
        </article>
      ))}
    </div>
  );

  const validate = () => {
    const nextErrors = {};
    const username = formData.username.trim();
    const email = formData.email.trim();

    if (!username) {
      nextErrors.username = "Username is required.";
    } else if (username.length < 3) {
      nextErrors.username = "Username must be at least 3 characters.";
    } else if (!/^[A-Za-z0-9_-]+$/.test(username)) {
      nextErrors.username = "Username may only contain letters, numbers, _ and -.";
    }

    if (!email) {
      nextErrors.email = "Email is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      nextErrors.email = "Please enter a valid email address.";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleFieldChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
    setMessage("");
  };

  const handleStartEdit = () => {
    setIsEditMode(true);
    setMessage("");
    setErrors({});
  };

  const handleCancelEdit = () => {
    setIsEditMode(false);
    setErrors({});
    setMessage("");
    setFormData({
      username: user?.username || "",
      email: user?.email || "",
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!validate()) {
      setMessageType("error");
      setMessage("Please fix the highlighted errors.");
      return;
    }

    setIsSubmitting(true);
    setMessage("");

    try {
      const response = await updateCurrentUser({
        username: formData.username.trim(),
        email: formData.email.trim(),
      });

      await refreshUser();
      setIsEditMode(false);
      setMessageType("success");
      setMessage(response?.data?.message || "Profile updated successfully.");
    } catch (error) {
      const detailErrors = getValidationErrors(error);
      setErrors({
        username: detailErrors?.username?.[0] || "",
        email: detailErrors?.email?.[0] || "",
      });
      setMessageType("error");
      setMessage(getErrorMessage(error, "Unable to update profile."));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AppLayout>
      <section className="space-y-6">
        <div className="rounded-card border border-ui-border/50 bg-gradient-to-br from-surface-raised/95 to-surface-base/95 p-6 shadow-card-light dark:shadow-card-dark">
          <div className="flex flex-col gap-6 md:flex-row md:items-center">
            <div className="flex items-center gap-4 md:w-[280px]">
              <span
                className="inline-flex h-24 w-24 items-center justify-center rounded-full text-3xl font-display text-content-primary md:h-28 md:w-28"
                style={avatar.style}
              >
                {avatar.initial}
              </span>
              <div>
                <h1 className="text-3xl font-semibold text-content-primary">My Profile</h1>
                <p className="text-sm text-content-tertiary">{displayName}</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="grid flex-1 gap-4 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="profileUsername"
                  className="mb-2 block text-sm text-content-tertiary"
                >
                  Username
                </label>
                <input
                  id="profileUsername"
                  name="username"
                  value={formData.username}
                  onChange={handleFieldChange}
                  disabled={!isEditMode || isSubmitting}
                  className={`w-full rounded-card border bg-surface-base px-3 py-2.5 text-sm text-content-primary outline-none transition focus:border-accent-400 ${
                    errors.username ? "border-danger" : "border-ui-border"
                  } disabled:cursor-not-allowed disabled:opacity-70`}
                />
                <p className="mt-1.5 min-h-[18px] text-xs text-danger">
                  {errors.username || ""}
                </p>
              </div>

              <div>
                <label
                  htmlFor="profileEmail"
                  className="mb-2 block text-sm text-content-tertiary"
                >
                  Email
                </label>
                <input
                  id="profileEmail"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleFieldChange}
                  disabled={!isEditMode || isSubmitting}
                  className={`w-full rounded-card border bg-surface-base px-3 py-2.5 text-sm text-content-primary outline-none transition focus:border-accent-400 ${
                    errors.email ? "border-danger" : "border-ui-border"
                  } disabled:cursor-not-allowed disabled:opacity-70`}
                />
                <p className="mt-1.5 min-h-[18px] text-xs text-danger">
                  {errors.email || ""}
                </p>
              </div>

              <div>
                <p className="mb-2 text-sm text-content-tertiary">Role</p>
                <p className="rounded-card border border-ui-border bg-surface-base px-3 py-2.5 text-sm text-content-primary">
                  {getPrimaryRole(user)}
                </p>
              </div>

              <div>
                <p className="mb-2 text-sm text-content-tertiary">Registered at</p>
                <p className="rounded-card border border-ui-border bg-surface-base px-3 py-2.5 text-sm text-content-primary">
                  {registeredAt}
                </p>
              </div>

              <div className="sm:col-span-2 flex flex-wrap items-center gap-3">
                {!isEditMode ? (
                  <button
                    type="button"
                    onClick={handleStartEdit}
                    className="rounded-lg border border-accent-400 bg-gradient-to-br from-accent-400 to-accent-500 px-4 py-2 text-sm font-semibold text-content-inverse transition hover:-translate-y-0.5 hover:shadow-glow-accent"
                  >
                    Edit profile
                  </button>
                ) : (
                  <>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="rounded-lg border border-accent-400 bg-gradient-to-br from-accent-400 to-accent-500 px-4 py-2 text-sm font-semibold text-content-inverse transition hover:-translate-y-0.5 hover:shadow-glow-accent disabled:cursor-not-allowed disabled:opacity-70"
                    >
                      {isSubmitting ? "Saving..." : "Save changes"}
                    </button>
                    <button
                      type="button"
                      onClick={handleCancelEdit}
                      disabled={isSubmitting}
                      className="rounded-lg border border-ui-border px-4 py-2 text-sm font-medium text-content-primary transition hover:border-ui-border-strong disabled:cursor-not-allowed disabled:opacity-70"
                    >
                      Cancel
                    </button>
                  </>
                )}
                <FormMessage message={message} type={messageType} />
              </div>
            </form>
          </div>
        </div>

        <div className="rounded-card border border-ui-border/50 bg-gradient-to-br from-surface-raised/95 to-surface-base/95 p-6 shadow-card-light dark:shadow-card-dark">
          <div className="mb-5 inline-flex rounded-pill border border-ui-border bg-surface-base p-1">
            <button
              type="button"
              onClick={() => setActiveTab("ideas")}
              className={`rounded-pill px-4 py-1.5 text-xs font-semibold transition ${
                activeTab === "ideas"
                  ? "bg-accent-400/20 text-accent-600 dark:text-accent-200"
                  : "text-content-tertiary hover:text-content-secondary"
              }`}
            >
              My Ideas
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("comments")}
              className={`rounded-pill px-4 py-1.5 text-xs font-semibold transition ${
                activeTab === "comments"
                  ? "bg-accent-400/20 text-accent-600 dark:text-accent-200"
                  : "text-content-tertiary hover:text-content-secondary"
              }`}
            >
              My comments
            </button>
          </div>

          {activeTab === "ideas" && (
            <div className="space-y-6">
              {isLoadingIdeas ? (
                <div className="rounded-card border border-ui-border bg-surface-base p-4 text-sm text-content-tertiary">
                  Loading your ideas...
                </div>
              ) : null}

              {ideasError ? (
                <div className="rounded-card border border-danger/40 bg-danger/10 p-4 text-sm text-danger">
                  {ideasError}
                </div>
              ) : null}

              {!isLoadingIdeas && !ideasError ? (
                <div className="space-y-6">
                  {!isDeveloperUser ? (
                    <div>
                      <h3 className="mb-3 text-sm font-semibold text-content-primary">
                        My Ideas
                      </h3>
                      {renderIdeaCollection(myIdeas, "You have not created ideas yet.")}
                    </div>
                  ) : null}

                  {isDeveloperUser ? (
                    <div>
                      <h3 className="mb-3 text-sm font-semibold text-content-primary">
                        Currently Working On
                      </h3>
                      {renderIdeaCollection(
                        currentlyWorkingIdeas,
                        "You are not currently working on any ideas.",
                      )}
                    </div>
                  ) : null}

                  {isDeveloperUser ? (
                    <div>
                      <h3 className="mb-3 text-sm font-semibold text-content-primary">
                        Completed Ideas
                      </h3>
                      {renderIdeaCollection(
                        completedIdeas,
                        "You have not completed any ideas yet.",
                      )}
                    </div>
                  ) : null}
                </div>
              ) : null}
            </div>
          )}
          {activeTab === "comments" && (
            <div className="space-y-4">
              {isLoadingComments ? (
                <div className="rounded-card border border-ui-border bg-surface-base p-4 text-sm text-content-tertiary">
                  Loading your comments...
                </div>
              ) : null}

              {commentsError ? (
                <div className="rounded-card border border-danger/40 bg-danger/10 p-4 text-sm text-danger">
                  {commentsError}
                </div>
              ) : null}

              {!isLoadingComments && !commentsError && myComments.length === 0 ? (
                <div className="rounded-card border border-ui-border bg-surface-base p-4 text-sm text-content-tertiary">
                  You have not made any comments yet.
                </div>
              ) : null}

              {myComments.map((comment) => (
                <MyCommentCard key={comment.id} comment={comment} />
              ))}

              {commentsPagination && commentsPagination.total_pages > 1 ? (
                <div className="flex items-center justify-between gap-3 rounded-card border border-ui-border/50 bg-surface-base/80 px-4 py-3 text-sm text-content-tertiary">
                  <span>
                    Page {commentsPagination.page} of {commentsPagination.total_pages}
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setCommentsPage((p) => Math.max(1, p - 1))}
                      disabled={commentsPage <= 1 || isLoadingComments}
                      className="rounded-lg border border-ui-border px-3 py-1.5 text-content-primary transition disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Prev
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setCommentsPage((p) =>
                          Math.min(commentsPagination.total_pages, p + 1)
                        )
                      }
                      disabled={
                        commentsPage >= commentsPagination.total_pages || isLoadingComments
                      }
                      className="rounded-lg border border-ui-border px-3 py-1.5 text-content-primary transition disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Next
                    </button>
                  </div>
                </div>
              ) : null}
            </div>
          )}
        </div>
      </section>
    </AppLayout>
  );
}

export default ProfilePage;
