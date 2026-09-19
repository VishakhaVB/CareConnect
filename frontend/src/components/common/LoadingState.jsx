export function LoadingState({ message = 'Loading...' }) {
  return (
    <div className="state-container">
      <div className="spinner spinner-primary" />
      <p className="text-muted text-sm font-medium" style={{ marginTop: '1rem' }}>
        {message}
      </p>
    </div>
  );
}
