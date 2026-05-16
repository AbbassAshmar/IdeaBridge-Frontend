import { useEffect, useMemo, useState } from "react";
import { MessageSquare, Wrench } from "lucide-react";
import { useParams } from "react-router-dom";
import AppLayout from "../components/AppLayout";
import CommentCard from "../components/CommentCard";
import IdeaCard from "../components/IdeaCard";
import { useAuth } from "../hooks/useAuth";
import { createIdeaComment, getIdeaComments, setCommentInteraction } from "../services/api/comments";
import { getErrorMessage } from "../services/api/client";
import {
    completeIdea,
    createIdeaUpdate,
    getIdeaById,
    getIdeaUpdates,
    leaveIdea,
    setIdeaInteraction,
    takeIdea,
} from "../services/api/ideas";
import { formatIdeaStatus } from "../utils/ideaStatus";

function formatRelativeTime(isoDate) {
    if (!isoDate) {
        return "";
    }

    const now = Date.now();
    const timestamp = new Date(isoDate).getTime();
    const diff = timestamp - now;

    const minute = 60 * 1000;
    const hour = 60 * minute;
    const day = 24 * hour;

    const formatter = new Intl.RelativeTimeFormat(undefined, { numeric: "auto" });

    if (Math.abs(diff) < hour) {
        return formatter.format(Math.round(diff / minute), "minute");
    }

    if (Math.abs(diff) < day) {
        return formatter.format(Math.round(diff / hour), "hour");
    }

    return formatter.format(Math.round(diff / day), "day");
}

function IdeaDetailsPage() {
    const { idea_id: ideaIdParam } = useParams();
    const { user } = useAuth();
    const ideaId = useMemo(() => Number(ideaIdParam), [ideaIdParam]);

    const [idea, setIdea] = useState(null);
    const [isLoadingIdea, setIsLoadingIdea] = useState(false);
    const [ideaErrorMessage, setIdeaErrorMessage] = useState("");
    const [isIdeaVoteLoading, setIsIdeaVoteLoading] = useState(false);
    const [isWorkflowLoading, setIsWorkflowLoading] = useState(false);

    const [updates, setUpdates] = useState([]);
    const [isLoadingUpdates, setIsLoadingUpdates] = useState(false);
    const [updatesErrorMessage, setUpdatesErrorMessage] = useState("");
    const [updateText, setUpdateText] = useState("");
    const [isSubmittingUpdate, setIsSubmittingUpdate] = useState(false);
    const [updateSubmitError, setUpdateSubmitError] = useState("");

    const [comments, setComments] = useState([]);
    const [commentsPagination, setCommentsPagination] = useState(null);
    const [commentsPage, setCommentsPage] = useState(1);
    const [isLoadingComments, setIsLoadingComments] = useState(false);
    const [commentsErrorMessage, setCommentsErrorMessage] = useState("");
    const [commentVoteLoadingId, setCommentVoteLoadingId] = useState(null);

    const [commentText, setCommentText] = useState("");
    const [isSubmittingComment, setIsSubmittingComment] = useState(false);
    const [commentSubmitError, setCommentSubmitError] = useState("");

    const [activeReplyTarget, setActiveReplyTarget] = useState(null);
    const [replyText, setReplyText] = useState("");
    const [isSubmittingReply, setIsSubmittingReply] = useState(false);
    const [replySubmitError, setReplySubmitError] = useState("");

    const totalCommentPages = commentsPagination?.total_pages ?? 1;

    const loadIdea = async () => {
        if (!Number.isInteger(ideaId) || ideaId <= 0) {
            setIdeaErrorMessage("Invalid idea id.");
            setIdea(null);
            return;
        }

        try {
            setIsLoadingIdea(true);
            setIdeaErrorMessage("");

            const response = await getIdeaById(ideaId);
            setIdea(response?.data?.idea ?? null);
        } catch (error) {
            setIdeaErrorMessage(getErrorMessage(error, "Failed to load idea."));
            setIdea(null);
        } finally {
            setIsLoadingIdea(false);
        }
    };

    const loadUpdates = async () => {
        if (!Number.isInteger(ideaId) || ideaId <= 0) {
            setUpdatesErrorMessage("Invalid idea id.");
            setUpdates([]);
            return;
        }

        try {
            setIsLoadingUpdates(true);
            setUpdatesErrorMessage("");

            const response = await getIdeaUpdates(ideaId);
            setUpdates(response?.data?.updates ?? []);
        } catch (error) {
            setUpdatesErrorMessage(getErrorMessage(error, "Failed to load development updates."));
            setUpdates([]);
        } finally {
            setIsLoadingUpdates(false);
        }
    };

    const loadComments = async (page) => {
        if (!Number.isInteger(ideaId) || ideaId <= 0) {
            setCommentsErrorMessage("Invalid idea id.");
            setComments([]);
            setCommentsPagination(null);
            return;
        }

        try {
            setIsLoadingComments(true);
            setCommentsErrorMessage("");

            const response = await getIdeaComments(ideaId, {
                page,
                limit: 10,
            });

            setComments(response?.data?.comments ?? []);
            setCommentsPagination(response?.meta?.pagination ?? null);
        } catch (error) {
            setCommentsErrorMessage(getErrorMessage(error, "Failed to load comments."));
            setComments([]);
            setCommentsPagination(null);
        } finally {
            setIsLoadingComments(false);
        }
    };

    useEffect(() => {
        setCommentsPage(1);
        loadIdea();
        loadUpdates();
    }, [ideaId]);

    useEffect(() => {
        loadComments(commentsPage);
    }, [ideaId, commentsPage]);

    const handleIdeaVote = async (_ideaId, state) => {
        if (!idea) {
            return;
        }

        try {
            setIsIdeaVoteLoading(true);
            const response = await setIdeaInteraction(idea.id, state);
            const interaction = response?.data?.interaction;

            if (!interaction) {
                return;
            }

            setIdea((prev) =>
                prev
                    ? {
                          ...prev,
                          user_vote: interaction.user_vote,
                          upvotes_count: interaction.upvotes_count,
                          downvotes_count: interaction.downvotes_count,
                      }
                    : prev,
            );
        } catch (error) {
            setIdeaErrorMessage(getErrorMessage(error, "Failed to update vote."));
        } finally {
            setIsIdeaVoteLoading(false);
        }
    };

    const applyWorkflowResponse = (response) => {
        const nextIdea = response?.data?.idea ?? null;
        if (nextIdea) {
            setIdea(nextIdea);
        }
    };

    const handleTakeIdea = async () => {
        if (!idea) {
            return;
        }

        try {
            setIsWorkflowLoading(true);
            setIdeaErrorMessage("");
            const response = await takeIdea(idea.id);
            applyWorkflowResponse(response);
            await loadUpdates();
        } catch (error) {
            setIdeaErrorMessage(getErrorMessage(error, "Failed to take idea."));
        } finally {
            setIsWorkflowLoading(false);
        }
    };

    const handleLeaveIdea = async () => {
        if (!idea) {
            return;
        }

        try {
            setIsWorkflowLoading(true);
            setIdeaErrorMessage("");
            const response = await leaveIdea(idea.id);
            applyWorkflowResponse(response);
            await loadUpdates();
        } catch (error) {
            setIdeaErrorMessage(getErrorMessage(error, "Failed to leave idea."));
        } finally {
            setIsWorkflowLoading(false);
        }
    };

    const handleCompleteIdea = async () => {
        if (!idea) {
            return;
        }

        try {
            setIsWorkflowLoading(true);
            setIdeaErrorMessage("");
            const response = await completeIdea(idea.id);
            applyWorkflowResponse(response);
            await loadUpdates();
        } catch (error) {
            setIdeaErrorMessage(getErrorMessage(error, "Failed to complete idea."));
        } finally {
            setIsWorkflowLoading(false);
        }
    };

    const handleSubmitUpdate = async (event) => {
        event.preventDefault();

        const text = updateText.trim();
        if (!text) {
            setUpdateSubmitError("Update text is required.");
            return;
        }

        try {
            setIsSubmittingUpdate(true);
            setUpdateSubmitError("");
            await createIdeaUpdate(ideaId, { text });
            setUpdateText("");
            await loadUpdates();
        } catch (error) {
            setUpdateSubmitError(getErrorMessage(error, "Failed to post update."));
        } finally {
            setIsSubmittingUpdate(false);
        }
    };

    const updateCommentInteractionInState = (commentId, interaction) => {
        const patch = {
            auth_user_interaction: interaction?.auth_user_interaction ?? null,
            upvotes_count: interaction?.upvotes_count ?? 0,
            downvotes_count: interaction?.downvotes_count ?? 0,
        };

        setComments((prev) =>
            prev.map((comment) => {
                if (comment.id === commentId) {
                    return {
                        ...comment,
                        ...patch,
                    };
                }

                const nextReplies = (comment?.replies || []).map((reply) =>
                    reply.id === commentId
                        ? {
                              ...reply,
                              ...patch,
                          }
                        : reply,
                );

                return {
                    ...comment,
                    replies: nextReplies,
                };
            }),
        );
    };

    const handleCommentVote = async (commentId, state) => {
        try {
            setCommentVoteLoadingId(commentId);
            const response = await setCommentInteraction(commentId, state);
            updateCommentInteractionInState(commentId, response?.data?.interaction);
        } catch (error) {
            setCommentsErrorMessage(getErrorMessage(error, "Failed to update comment vote."));
        } finally {
            setCommentVoteLoadingId(null);
        }
    };

    const handleSubmitComment = async (event) => {
        event.preventDefault();

        const text = commentText.trim();

        if (!text) {
            setCommentSubmitError("Comment text is required.");
            return;
        }

        try {
            setIsSubmittingComment(true);
            setCommentSubmitError("");
            await createIdeaComment(ideaId, { text });
            setCommentText("");
            await loadComments(commentsPage);
        } catch (error) {
            setCommentSubmitError(getErrorMessage(error, "Failed to post comment."));
        } finally {
            setIsSubmittingComment(false);
        }
    };

    const handleStartReply = (comment) => {
        setActiveReplyTarget({
            id: comment.id,
            username: comment?.user?.username || comment?.user?.email || "Unknown",
        });
        setReplyText("");
        setReplySubmitError("");
    };

    const handleCancelReply = () => {
        setActiveReplyTarget(null);
        setReplyText("");
        setReplySubmitError("");
    };

    const handleSubmitReply = async (event) => {
        event.preventDefault();

        const text = replyText.trim();

        if (!activeReplyTarget?.id) {
            return;
        }

        if (!text) {
            setReplySubmitError("Reply text is required.");
            return;
        }

        try {
            setIsSubmittingReply(true);
            setReplySubmitError("");
            await createIdeaComment(ideaId, {
                text,
                parent_id: activeReplyTarget.id,
            });

            handleCancelReply();
            await loadComments(commentsPage);
        } catch (error) {
            setReplySubmitError(getErrorMessage(error, "Failed to post reply."));
        } finally {
            setIsSubmittingReply(false);
        }
    };

    const renderReplyForm = (commentId) => {
        if (activeReplyTarget?.id !== commentId) {
            return null;
        }

        return (
            <form onSubmit={handleSubmitReply} className="space-y-3 rounded-card border border-ui-border/70 bg-surface-sunken p-3">
                <p className="text-xs text-content-tertiary">
                    Replying to <span className="font-medium text-content-primary">@{activeReplyTarget.username}</span>
                </p>
                <textarea
                    value={replyText}
                    onChange={(event) => setReplyText(event.target.value)}
                    rows={3}
                    placeholder="Write your reply..."
                    className="w-full rounded-card border border-ui-border bg-surface-base px-3 py-2.5 text-sm text-content-primary outline-none transition focus:border-accent-400"
                />
                {replySubmitError ? (
                    <p className="text-xs text-danger">{replySubmitError}</p>
                ) : null}
                <div className="flex items-center gap-2">
                    <button
                        type="submit"
                        disabled={isSubmittingReply}
                        className="rounded-lg border border-accent-400 bg-gradient-to-br from-accent-400 to-accent-500 px-3 py-1.5 text-xs font-semibold text-content-inverse transition disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {isSubmittingReply ? "Posting..." : "Post reply"}
                    </button>
                    <button
                        type="button"
                        onClick={handleCancelReply}
                        disabled={isSubmittingReply}
                        className="rounded-lg border border-ui-border px-3 py-1.5 text-xs font-semibold text-content-primary transition disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        Cancel
                    </button>
                </div>
            </form>
        );
    };

    const renderWorkflowSection = () => {
        if (!idea) {
            return null;
        }

        const status = String(idea.status || "open");
        const assignee = idea?.taken_by_user?.username || idea?.taken_by_user?.email || "Unknown";

        return (
            <div className="rounded-card border border-ui-border/50 bg-gradient-to-br from-surface-raised/95 to-surface-base/95 p-6 shadow-card-light dark:shadow-card-dark">
                <h2 className="mb-3 text-lg font-semibold text-content-primary">Development Workflow</h2>
                <div className="space-y-2 text-sm text-content-secondary">
                    <p>
                        <span className="font-semibold text-content-primary">Status:</span> {formatIdeaStatus(status)}
                    </p>

                    {status === "in_progress" ? (
                        <p>
                            <span className="font-semibold text-content-primary">Working on this idea:</span> {assignee}
                        </p>
                    ) : null}

                    {status === "completed" ? (
                        <p>
                            <span className="font-semibold text-content-primary">Completed by:</span> {assignee}
                        </p>
                    ) : null}
                </div>

                <div className="mt-4 flex flex-wrap items-center gap-2">
                    {idea?.can_take ? (
                        <button
                            type="button"
                            onClick={handleTakeIdea}
                            disabled={isWorkflowLoading}
                            className="rounded-lg border border-accent-400 bg-gradient-to-br from-accent-400 to-accent-500 px-4 py-2 text-sm font-semibold text-content-inverse transition disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            Take Idea
                        </button>
                    ) : null}

                    {idea?.can_leave ? (
                        <button
                            type="button"
                            onClick={handleLeaveIdea}
                            disabled={isWorkflowLoading}
                            className="rounded-lg border border-ui-border px-4 py-2 text-sm font-semibold text-content-primary transition disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            Leave Idea
                        </button>
                    ) : null}

                    {idea?.can_complete ? (
                        <button
                            type="button"
                            onClick={handleCompleteIdea}
                            disabled={isWorkflowLoading}
                            className="rounded-lg border border-success bg-success/10 px-4 py-2 text-sm font-semibold text-success transition disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            Complete Idea
                        </button>
                    ) : null}
                </div>
            </div>
        );
    };

    return (
        <AppLayout>
            <section className="space-y-6">
                {isLoadingIdea ? (
                    <div className="rounded-card border border-ui-border/50 bg-surface-base/80 p-6 text-content-tertiary">
                        Loading idea...
                    </div>
                ) : null}

                {ideaErrorMessage ? (
                    <div className="rounded-card border border-danger/40 bg-danger/10 p-6 text-danger">
                        {ideaErrorMessage}
                    </div>
                ) : null}

                {!isLoadingIdea && !ideaErrorMessage && idea ? (
                    <IdeaCard
                        idea={idea}
                        onVote={handleIdeaVote}
                        isVoteLoading={isIdeaVoteLoading}
                    />
                ) : null}

                {!isLoadingIdea && !ideaErrorMessage && idea ? renderWorkflowSection() : null}

                <div className="rounded-card border border-ui-border/50 bg-gradient-to-br from-surface-raised/95 to-surface-base/95 p-6 shadow-card-light dark:shadow-card-dark">
                    <div className="mb-4 flex items-center gap-2 text-content-primary">
                        <Wrench size={18} />
                        <h2 className="text-xl font-semibold">Development Updates</h2>
                    </div>

                    {idea?.can_complete ? (
                        <form onSubmit={handleSubmitUpdate} className="mb-6 space-y-3">
                            <textarea
                                value={updateText}
                                onChange={(event) => setUpdateText(event.target.value)}
                                rows={3}
                                placeholder="What's new?"
                                className="w-full rounded-card border border-ui-border bg-surface-base px-3 py-3 text-sm text-content-primary outline-none transition focus:border-accent-400"
                            />
                            {updateSubmitError ? (
                                <p className="text-xs text-danger">{updateSubmitError}</p>
                            ) : null}
                            <button
                                type="submit"
                                disabled={isSubmittingUpdate}
                                className="rounded-lg border border-accent-400 bg-gradient-to-br from-accent-400 to-accent-500 px-4 py-2 text-sm font-semibold text-content-inverse transition disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {isSubmittingUpdate ? "Posting..." : "Post Update"}
                            </button>
                        </form>
                    ) : null}

                    <div className="space-y-3">
                        {isLoadingUpdates ? (
                            <div className="rounded-card border border-ui-border bg-surface-base p-4 text-sm text-content-tertiary">
                                Loading updates...
                            </div>
                        ) : null}

                        {updatesErrorMessage ? (
                            <div className="rounded-card border border-danger/40 bg-danger/10 p-4 text-sm text-danger">
                                {updatesErrorMessage}
                            </div>
                        ) : null}

                        {!isLoadingUpdates && !updatesErrorMessage && updates.length === 0 ? (
                            <div className="rounded-card border border-ui-border bg-surface-base p-4 text-sm text-content-tertiary">
                                No development updates yet.
                            </div>
                        ) : null}

                        {updates.map((update) => (
                            <article key={update.id} className="rounded-card border border-ui-border/70 bg-surface-base p-4">
                                <p className="mb-1 text-xs text-content-tertiary">
                                    <span className="font-semibold text-content-primary">
                                        {update?.user?.username || update?.user?.email || "Unknown"}
                                    </span>{" "}
                                    — {formatRelativeTime(update.created_at)}
                                </p>
                                <p className="text-sm text-content-secondary">{update.text}</p>
                            </article>
                        ))}
                    </div>
                </div>

                <div className="rounded-card border border-ui-border/50 bg-gradient-to-br from-surface-raised/95 to-surface-base/95 p-6 shadow-card-light dark:shadow-card-dark">
                    <div className="mb-4 flex items-center gap-2 text-content-primary">
                        <MessageSquare size={18} />
                        <h2 className="text-xl font-semibold">Comments</h2>
                    </div>

                    {user ? (
                        <form onSubmit={handleSubmitComment} className="mb-6 space-y-3">
                            <textarea
                                value={commentText}
                                onChange={(event) => setCommentText(event.target.value)}
                                rows={4}
                                placeholder="Write a comment..."
                                className="w-full rounded-card border border-ui-border bg-surface-base px-3 py-3 text-sm text-content-primary outline-none transition focus:border-accent-400"
                            />
                            {commentSubmitError ? (
                                <p className="text-xs text-danger">{commentSubmitError}</p>
                            ) : null}
                            <button
                                type="submit"
                                disabled={isSubmittingComment}
                                className="rounded-lg border border-accent-400 bg-gradient-to-br from-accent-400 to-accent-500 px-4 py-2 text-sm font-semibold text-content-inverse transition disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {isSubmittingComment ? "Posting..." : "Post comment"}
                            </button>
                        </form>
                    ) : null}

                    <div className="space-y-3">
                        {isLoadingComments ? (
                            <div className="rounded-card border border-ui-border bg-surface-base p-4 text-sm text-content-tertiary">
                                Loading comments...
                            </div>
                        ) : null}

                        {commentsErrorMessage ? (
                            <div className="rounded-card border border-danger/40 bg-danger/10 p-4 text-sm text-danger">
                                {commentsErrorMessage}
                            </div>
                        ) : null}

                        {!isLoadingComments && !commentsErrorMessage && comments.length === 0 ? (
                            <div className="rounded-card border border-ui-border bg-surface-base p-4 text-sm text-content-tertiary">
                                No comments yet.
                            </div>
                        ) : null}

                        {comments.map((comment) => (
                            <div key={comment.id} className="space-y-3">
                                <CommentCard
                                    comment={comment}
                                    onVote={handleCommentVote}
                                    isVoteLoading={commentVoteLoadingId === comment.id}
                                    onReply={handleStartReply}
                                >
                                    {renderReplyForm(comment.id)}
                                </CommentCard>

                                {(comment?.replies || []).map((reply) => (
                                    <CommentCard
                                        key={reply.id}
                                        comment={reply}
                                        isReply
                                        onVote={handleCommentVote}
                                        isVoteLoading={commentVoteLoadingId === reply.id}
                                        onReply={handleStartReply}
                                    >
                                        {renderReplyForm(reply.id)}
                                    </CommentCard>
                                ))}
                            </div>
                        ))}
                    </div>

                    {commentsPagination ? (
                        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-card border border-ui-border/50 bg-surface-base/70 px-4 py-3 text-sm text-content-tertiary">
                            <span>
                                Page {commentsPagination?.page ?? 1} of {totalCommentPages}
                            </span>
                            <div className="flex items-center gap-2">
                                <button
                                    type="button"
                                    onClick={() => setCommentsPage((prev) => Math.max(1, prev - 1))}
                                    disabled={(commentsPagination?.page ?? 1) <= 1 || isLoadingComments}
                                    className="rounded-lg border border-ui-border px-3 py-1.5 text-content-primary transition disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    Prev
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setCommentsPage((prev) => Math.min(totalCommentPages, prev + 1))}
                                    disabled={(commentsPagination?.page ?? 1) >= totalCommentPages || isLoadingComments}
                                    className="rounded-lg border border-ui-border px-3 py-1.5 text-content-primary transition disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    ) : null}
                </div>
            </section>
        </AppLayout>
    );
}

export default IdeaDetailsPage;
