import { useState, useEffect } from 'react';
import { notificationsApi } from '../../api/notifications';
import { useToast } from '../../context/ToastContext';
import { LoadingState } from '../../components/common/LoadingState';
import { EmptyState } from '../../components/common/EmptyState';
import { ErrorState } from '../../components/common/ErrorState';
import { Bell, CheckCheck, Check, Clock } from 'lucide-react';

export function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');
  const toast = useToast();

  const loadNotifications = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await notificationsApi.list();
      setNotifications(data);
    } catch (err) {
      setError(err.message || 'Failed to fetch notifications.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const handleMarkAsRead = async (id) => {
    try {
      await notificationsApi.markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
      );
      toast.success('Notification marked as read.');
    } catch (err) {
      toast.error(err.message || 'Failed to update notification.');
    }
  };

  const filtered = notifications.filter((n) => {
    if (filter === 'unread') return !n.is_read;
    return true;
  });

  return (
    <div className="max-w-4xl" style={{ padding: '1rem 0' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.75rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 className="text-3xl font-bold text-main" style={{ marginBottom: '0.25rem' }}>
            Notifications
          </h1>
          <p className="text-secondary text-sm">
            Activity updates, donation pledges, event reminders, and badge awards.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            onClick={() => setFilter('all')}
            className={`btn btn-sm ${filter === 'all' ? 'btn-primary' : 'btn-outline'}`}
          >
            All ({notifications.length})
          </button>
          <button
            onClick={() => setFilter('unread')}
            className={`btn btn-sm ${filter === 'unread' ? 'btn-primary' : 'btn-outline'}`}
          >
            Unread ({notifications.filter((n) => !n.is_read).length})
          </button>
        </div>
      </div>

      {loading ? (
        <LoadingState message="Fetching notifications..." />
      ) : error ? (
        <ErrorState message={error} onRetry={loadNotifications} />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={Bell}
          title="No notifications"
          description={filter === 'unread' ? 'You have caught up on all notifications!' : 'No notification history on your account yet.'}
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {filtered.map((n) => (
            <div
              key={n.id}
              className="card"
              style={{
                padding: '1.25rem 1.5rem',
                borderLeft: !n.is_read ? '4px solid var(--primary)' : '1px solid var(--border)',
                backgroundColor: !n.is_read ? '#f0f9ff' : '#ffffff',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                gap: '1rem',
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                  <h3 className="text-base font-bold text-main">{n.title}</h3>
                  {!n.is_read && (
                    <span className="badge badge-info" style={{ fontSize: '0.6875rem' }}>
                      New
                    </span>
                  )}
                </div>
                <p className="text-secondary text-sm leading-relaxed" style={{ marginBottom: '0.5rem' }}>
                  {n.message}
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                  <Clock size={13} />
                  <span>{new Date(n.created_at).toLocaleString()}</span>
                </div>
              </div>

              {!n.is_read && (
                <button
                  onClick={() => handleMarkAsRead(n.id)}
                  className="btn btn-outline btn-sm"
                  style={{ flexShrink: 0 }}
                  title="Mark as read"
                >
                  <Check size={14} />
                  Mark Read
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
