import { ExternalLink } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getAvatarData } from "../utils/avatar";

function MyCommentCard({ comment }) {
  const navigate = useNavigate();
  const score = (comment?.upvotes_count ?? 0) - (comment?.downvotes_count ?? 0);
  const displayName = comment?.user?.username || comment?.user?.email || "Unknown";
  const avatar = getAvatarData(displayName);
  const replyingToUsername = comment?.parent?.user?.username || null;

  return (
    <article className="rounded-card border border-ui-border/70 bg-surface-base p-4">
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
            Replying to{" "}
            <span className="font-medium">@{replyingToUsername}</span>
          </span>
        ) : null}
      </div>

      <p className="mt-3 whitespace-pre-wrap text-sm text-content-secondary">
        {comment?.text || ""}
      </p>

      <div className="mt-4 flex items-center justify-between gap-3">
        {/* Read-only vote display */}
        <div className="inline-flex items-center gap-2 rounded-pill border border-ui-border bg-surface-sunken px-3 py-1 text-sm font-semibold text-content-primary">
          <span
            className={
              comment?.auth_user_interaction === "upvote"
                ? "text-success"
                : "text-content-tertiary"
            }
            aria-label="Upvotes"
          >
            ▲
          </span>
          <span className="min-w-6 text-center">{score}</span>
          <span
            className={
              comment?.auth_user_interaction === "downvote"
                ? "text-danger"
                : "text-content-tertiary"
            }
            aria-label="Downvotes"
          >
            ▼
          </span>
        </div>

        {/* Go to idea */}
        <button
          type="button"
          title="Go to idea"
          onClick={() => navigate(`/ideas/${comment.idea_id}`)}
          className="inline-flex items-center justify-center rounded-lg border border-ui-border p-2 text-content-tertiary transition hover:border-accent-400 hover:text-accent-500"
          aria-label="Go to idea"
        >
          <ExternalLink size={15} />
        </button>
      </div>
    </article>
  );
}

export default MyCommentCard;