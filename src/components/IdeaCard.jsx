import { ArrowBigDown, ArrowBigUp } from "lucide-react";
import { formatIdeaStatus } from "../utils/ideaStatus";

function IdeaCard({
    idea,
    onVote,
    isVoteLoading = false,
    onOpen,
}) {
    const currentVote = idea?.user_vote || "neutral";
    const score = (idea?.upvotes_count ?? 0) - (idea?.downvotes_count ?? 0);

    const resolveNextState = (targetState) => {
        return currentVote === targetState ? "neutral" : targetState;
    };

    const handleVoteClick = (event, targetState) => {
        event.stopPropagation();

        if (!onVote || isVoteLoading) {
            return;
        }

        onVote(idea.id, resolveNextState(targetState));
    };

    const handleOpen = () => {
        if (!onOpen) {
            return;
        }

        onOpen(idea.id);
    };

    const handleKeyDown = (event) => {
        if (!onOpen) {
            return;
        }

        if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            onOpen(idea.id);
        }
    };

    return (
        <article
            role={onOpen ? "button" : undefined}
            tabIndex={onOpen ? 0 : undefined}
            onClick={handleOpen}
            onKeyDown={handleKeyDown}
            className={`rounded-card border border-ui-border/50 bg-gradient-to-br from-surface-raised/90 to-surface-base/90 p-6 shadow-card-light dark:shadow-card-dark ${
                onOpen
                    ? "cursor-pointer transition hover:border-accent-400/50 hover:-translate-y-0.5"
                    : ""
            }`}
        >
            <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div>
                    <div className="mb-2 flex flex-wrap items-center gap-2 text-sm text-content-tertiary">
                        <span className="rounded-badge border border-accent-400/40 bg-accent-400/10 px-3 py-1 text-xs font-semibold text-accent-600 dark:text-accent-200">
                            {idea?.category?.name || "Uncategorized"}
                        </span>
                        <span className="rounded-badge border border-ui-border bg-surface-sunken/60 px-3 py-1 text-xs font-semibold text-content-primary">
                            {formatIdeaStatus(idea?.status)}
                        </span>
                        <span className="text-xs">
                            {idea?.created_at ? new Date(idea.created_at).toLocaleString() : ""}
                        </span>
                    </div>
                    <h2 className="text-xl font-semibold text-content-primary">{idea?.title}</h2>
                    <p className="mt-2 text-sm text-content-secondary">{idea?.description}</p>
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

            <div className="mt-4 flex items-center">
                <div className="inline-flex items-center gap-2 rounded-pill border border-ui-border bg-surface-base px-2 py-1 text-content-primary">
                    <button
                        type="button"
                        onClick={(event) => handleVoteClick(event, "upvote")}
                        disabled={isVoteLoading}
                        aria-label="Upvote idea"
                        className={`inline-flex h-8 w-8 items-center justify-center rounded-pill transition ${
                            currentVote === "upvote"
                                ? "bg-success/20 text-success"
                                : "text-content-tertiary hover:text-content-primary"
                        } disabled:cursor-not-allowed disabled:opacity-60`}
                    >
                        <ArrowBigUp size={18} />
                    </button>
                    <span className="min-w-8 text-center text-sm font-semibold">{score}</span>
                    <button
                        type="button"
                        onClick={(event) => handleVoteClick(event, "downvote")}
                        disabled={isVoteLoading}
                        aria-label="Downvote idea"
                        className={`inline-flex h-8 w-8 items-center justify-center rounded-pill transition ${
                            currentVote === "downvote"
                                ? "bg-danger/20 text-danger"
                                : "text-content-tertiary hover:text-content-primary"
                        } disabled:cursor-not-allowed disabled:opacity-60`}
                    >
                        <ArrowBigDown size={18} />
                    </button>
                </div>
            </div>
        </article>
    );
}

export default IdeaCard;
