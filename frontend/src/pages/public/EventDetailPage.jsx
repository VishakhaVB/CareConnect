import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { eventsApi } from '../../api/events';
import { orphanagesApi } from '../../api/orphanages';
import { StatusBadge } from '../../components/common/StatusBadge';
import { LoadingState } from '../../components/common/LoadingState';
import { EmptyState } from '../../components/common/EmptyState';
import { ErrorState } from '../../components/common/ErrorState';
import { Calendar, MapPin, Building2, UserCheck, AlertCircle, ArrowLeft } from 'lucide-react';

export function EventDetailPage() {
  const { id } = useParams();
  const { user, isVolunteer } = useAuth();
  const toast = useToast();

  const [event, setEvent] = useState(null);
  const [orphanage, setOrphanage] = useState(null);
  const [isParticipating, setIsParticipating] = useState(false);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      const ev = await eventsApi.getById(id);
      setEvent(ev);

      const orph = await orphanagesApi.getById(ev.orphanage_id).catch(() => null);
      setOrphanage(orph);

      if (user && isVolunteer) {
        const participations = await eventsApi.getMyParticipations().catch(() => []);
        const enrolled = participations.some((p) => p.event_id === Number(id));
        setIsParticipating(enrolled);
      }
    } catch (err) {
      setError(err.message || 'Failed to load event details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [id, user]);

  const handleParticipate = async () => {
    setActionLoading(true);
    try {
      await eventsApi.participate(id);
      setIsParticipating(true);
      toast.success('Successfully registered as a volunteer for this event!');
    } catch (err) {
      toast.error(err.message || 'Failed to register for this event.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancelParticipation = async () => {
    setActionLoading(true);
    try {
      await eventsApi.cancelParticipation(id);
      setIsParticipating(false);
      toast.info('Your event participation has been cancelled.');
    } catch (err) {
      toast.error(err.message || 'Failed to cancel participation.');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return <LoadingState message="Loading event details..." />;
  if (error) return <ErrorState message={error} onRetry={loadData} />;
  if (!event) return <EmptyState title="Event not found" />;

  return (
    <div className="max-w-4xl" style={{ padding: '2.5rem 1.5rem' }}>
      <Link to="/events" className="btn-ghost btn-sm" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem', marginBottom: '1.25rem' }}>
        <ArrowLeft size={16} />
        Back to Events
      </Link>

      <div className="card" style={{ padding: '2.5rem 2rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
          <StatusBadge status={event.status} />
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.875rem', fontWeight: 600 }}>
            <Calendar size={16} className="text-primary" />
            {new Date(event.event_date).toLocaleString(undefined, {
              weekday: 'short',
              year: 'numeric',
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </div>
        </div>

        <h1 className="text-3xl font-extrabold text-main" style={{ marginBottom: '1rem' }}>
          {event.title}
        </h1>

        {event.location && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.9375rem', marginBottom: '1.5rem' }}>
            <MapPin size={18} className="text-teal" />
            <span>{event.location}</span>
          </div>
        )}

        <div style={{ borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)', padding: '1.5rem 0', margin: '1.5rem 0' }}>
          <h3 className="text-base font-bold text-main" style={{ marginBottom: '0.5rem' }}>
            Event Description & Volunteer Scope
          </h3>
          <p className="text-secondary text-sm leading-relaxed" style={{ whiteSpace: 'pre-line' }}>
            {event.description || 'No detailed description provided by the organizers.'}
          </p>
        </div>

        {/* Host Orphanage Card */}
        {orphanage && (
          <div
            style={{
              padding: '1.25rem',
              backgroundColor: 'var(--bg-subtle)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '1rem',
              marginBottom: '1.5rem',
            }}
          >
            <div>
              <span className="text-xs text-muted font-medium">Organized by Care Home</span>
              <h4 className="text-base font-bold text-main" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.125rem' }}>
                <Building2 size={16} className="text-primary" />
                {orphanage.name}
              </h4>
              <p className="text-xs text-secondary" style={{ marginTop: '0.25rem' }}>
                {orphanage.address}
              </p>
            </div>
            <Link to={`/orphanages/${orphanage.id}`} className="btn btn-outline btn-sm">
              View Orphanage Profile
            </Link>
          </div>
        )}

        {/* Participation Action Section */}
        <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1.5rem' }}>
          {!user ? (
            <div
              style={{
                padding: '1.25rem',
                backgroundColor: 'var(--bg-subtle)',
                borderRadius: 'var(--radius-md)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '1rem',
              }}
            >
              <div>
                <h4 className="text-sm font-bold text-main">Want to volunteer for this event?</h4>
                <p className="text-xs text-muted">Sign in with a Volunteer account to register your participation.</p>
              </div>
              <Link to="/login" className="btn btn-primary btn-sm">
                Sign In to Participate
              </Link>
            </div>
          ) : !isVolunteer ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '1rem', backgroundColor: 'var(--warning-bg)', color: 'var(--warning)', borderRadius: 'var(--radius-md)', fontSize: '0.875rem' }}>
              <AlertCircle size={20} style={{ flexShrink: 0 }} />
              <div>
                <span className="font-semibold">Volunteer account required:</span> Your account is registered as a &quot;{user.role}&quot;. Only users with a volunteer or both role can register for events.
              </div>
            </div>
          ) : isParticipating ? (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '1rem',
                padding: '1rem 1.25rem',
                backgroundColor: 'var(--success-bg)',
                borderRadius: 'var(--radius-md)',
                color: 'var(--success)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                <UserCheck size={20} />
                <span className="text-sm font-bold">You are registered to volunteer for this event!</span>
              </div>
              <button
                onClick={handleCancelParticipation}
                className="btn btn-danger btn-sm"
                disabled={actionLoading}
              >
                {actionLoading ? <span className="spinner" /> : 'Cancel Participation'}
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <h4 className="text-sm font-bold text-main">Ready to help?</h4>
                <p className="text-xs text-muted">Register your attendance so the orphanage can prepare materials and activities.</p>
              </div>
              <button
                onClick={handleParticipate}
                className="btn btn-primary"
                disabled={actionLoading}
              >
                {actionLoading ? <span className="spinner" /> : 'Participate in Event'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
