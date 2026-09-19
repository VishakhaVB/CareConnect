import { Inbox } from 'lucide-react';

export function EmptyState({
  icon: Icon = Inbox,
  title = 'No items found',
  description = 'There are no records available to display at this time.',
  action,
}) {
  return (
    <div className="state-container card" style={{ padding: '3rem 1.5rem', margin: '1rem 0' }}>
      <div
        style={{
          width: '3.5rem',
          height: '3.5rem',
          borderRadius: 'var(--radius-full)',
          backgroundColor: 'var(--bg-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--text-muted)',
          marginBottom: '1rem',
        }}
      >
        <Icon size={28} />
      </div>
      <h3 className="text-lg font-bold text-main" style={{ marginBottom: '0.375rem' }}>
        {title}
      </h3>
      <p className="text-muted text-sm" style={{ maxWidth: '24rem', marginBottom: action ? '1.25rem' : 0 }}>
        {description}
      </p>
      {action && <div>{action}</div>}
    </div>
  );
}
