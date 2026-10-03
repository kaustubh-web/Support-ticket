export const StatusBadge = ({ status }) => (
  <span className={`badge status-${status.replace(" ", "-").toLowerCase()}`}><i />{status}</span>
);
export const PriorityBadge = ({ priority }) => <span className={`prio prio-${priority.toLowerCase()}`}>{priority}</span>;
