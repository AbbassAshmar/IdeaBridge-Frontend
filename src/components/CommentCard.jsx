import { ArrowBigDown, ArrowBigUp } from "lucide-react";
import { getAvatarData } from "../utils/avatar";

function CommentCard({
    comment,
    isReply = false,
    onVote,
    isVoteLoading = false,
    onReply,
    children,
}) {
    const currentInteraction = comment?.auth_user_interaction || null;
    const score = (comment?.upvotes_count ?? 0) - (comment?.downvotes_count ?? 0);
    const displayName = comment?.user?.username || comment?.user?.email || "Unknown";
    const avatar = getAvatarData(displayName);
    const replyingToUsername = comment?.parent?.user?.username || null;

    const handleVoteClick = (targetState) => {
        if (!onVote || isVoteLoading) {
            return;
        }

        const nextState = currentInteraction === targetState ? "neutral" : targetState;
        onVote(comment.id, nextState);
    };

    return (
        <article
            className={`rounded-card border border-ui-border/70 bg-surface-base p-4 ${
                isReply ? "ml-6" : ""
            }`}
        >
            <div className="flex flex-wrap items-center gap-3 text-sm">
                <span
                    className="inline-flex h-8 w-8 items-center justify-center rounded-pill text-xs font-display text-content-primary"
                    style={avatar.style}
                    aria-hidden="true"
                >
                    {avatar.initial}
                </span>
                <span className="font-semibold text-content-primary">{displayName}</span>
                <span className="text-xs text-content-tertiary">
                    {comment?.created_at ? new Date(comment.created_at).toLocaleString() : ""}
                </span>
                {replyingToUsername ? (
                    <span className="text-xs text-content-tertiary">
                        Replying to <span className="font-medium">@{replyingToUsername}</span>
                    </span>
                ) : null}
            </div>

            <p className="mt-3 whitespace-pre-wrap text-sm text-content-secondary">{comment?.text || ""}</p>

            <div className="mt-4 flex items-center justify-between gap-3">
                <div className="inline-flex items-center gap-2 rounded-pill border border-ui-border bg-surface-sunken px-2 py-1 text-content-primary">
                    <button
                        type="button"
                        onClick={() => handleVoteClick("upvote")}
                        disabled={isVoteLoading}
                        aria-label="Upvote comment"
                        className={`inline-flex h-8 w-8 items-center justify-center rounded-pill transition ${
                            currentInteraction === "upvote"
                                ? "bg-success/20 text-success"
                                : "text-content-tertiary hover:text-content-primary"
                        } disabled:cursor-not-allowed disabled:opacity-60`}
                    >
                        <ArrowBigUp size={18} />
                    </button>
                    <span className="min-w-8 text-center text-sm font-semibold">{score}</span>
                    <button
                        type="button"
                        onClick={() => handleVoteClick("downvote")}
                        disabled={isVoteLoading}
                        aria-label="Downvote comment"
                        className={`inline-flex h-8 w-8 items-center justify-center rounded-pill transition ${
                            currentInteraction === "downvote"
                                ? "bg-danger/20 text-danger"
                                : "text-content-tertiary hover:text-content-primary"
                        } disabled:cursor-not-allowed disabled:opacity-60`}
                    >
                        <ArrowBigDown size={18} />
                    </button>
                </div>

                <button
                    type="button"
                    onClick={() => onReply?.(comment)}
                    className="rounded-lg border border-ui-border px-3 py-1.5 text-xs font-semibold text-content-primary transition hover:border-ui-border-strong"
                >
                    Reply
                </button>
            </div>

            {children ? <div className="mt-4">{children}</div> : null}
        </article>
    );
}

export default CommentCard;
