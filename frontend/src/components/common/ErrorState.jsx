import { AlertCircle, RefreshCw } from 'lucide-react';

export function ErrorState({
  title = 'Something went wrong',
  message = 'An error occurred while fetching data.',
  onRetry,
}) {
  return (
    <div className="state-container card" style={{ padding: '3rem 1.5rem', margin: '1rem 0' }}>
      <div
        style={{
          width: '3.5rem',
          height: '3.5rem',
          borderRadius: 'var(--radius-full)',
          backgroundColor: 'var(--danger-bg)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--danger)',
          marginBottom: '1rem',
        }}
      >
        <AlertCircle size={28} />
      </div>
      <h3 className="text-lg font-bold text-main" style={{ marginBottom: '0.375rem' }}>
        {title}
      </h3>
      <p className="text-muted text-sm" style={{ maxWidth: '24rem', marginBottom: onRetry ? '1.25rem' : 0 }}>
        {message}
      </p>
      {onRetry && (
        <button className="btn btn-outline btn-sm" onClick={onRetry}>
          <RefreshCw size={14} />
          Try Again
        </button>
      )}
    </div>
  );
}
