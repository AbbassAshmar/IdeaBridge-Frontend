const LABELS = {
    open: "Open",
    in_progress: "In Progress",
    completed: "Completed",
    cancelled: "Cancelled",
};

export function formatIdeaStatus(status) {
    const normalized = String(status || "open").toLowerCase();
    return LABELS[normalized] || normalized.replace(/_/g, " ");
}
