export function StatusBadge({ status }) {
  if (!status) return null;

  const normalized = String(status).toLowerCase();

  let badgeClass = 'badge-gray';
  let label = status;

  switch (normalized) {
    case 'verified':
    case 'completed':
    case 'active':
    case 'registered':
      badgeClass = 'badge-verified';
      break;
    case 'pending':
    case 'pledged':
    case 'upcoming':
      badgeClass = 'badge-pending';
      break;
    case 'rejected':
    case 'cancelled':
    case 'closed':
    case 'high':
    case 'critical':
      badgeClass = 'badge-rejected';
      break;
    case 'open':
    case 'donor':
    case 'volunteer':
    case 'normal':
      badgeClass = 'badge-open';
      break;
    case 'both':
    case 'admin':
      badgeClass = 'badge-both';
      break;
    default:
      badgeClass = 'badge-gray';
  }

  return <span className={`badge ${badgeClass}`}>{label}</span>;
}
