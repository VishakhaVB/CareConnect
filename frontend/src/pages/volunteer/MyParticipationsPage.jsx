import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { eventsApi } from '../../api/events';
import { orphanagesApi } from '../../api/orphanages';
import { useToast } from '../../context/ToastContext';
import { LoadingState } from '../../components/common/LoadingState';
import { EmptyState } from '../../components/common/EmptyState';
import { StatusBadge } from '../../components/common/StatusBadge';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import {
  Calendar,
  MapPin,
  Building2,
  ExternalLink,
  UserX,
  CheckCircle2,
  Clock,
  Sparkles,
} from 'lucide-react';

export function MyParticipationsPage() {
  const [participations, setParticipations] = useState([]);
  const [eventsMap, setEventsMap] = useState({});
  const [orphanagesMap, setOrphanagesMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [cancellingEventId, setCancellingEventId] = useState(null);
  const [cancelling, setCancelling] = useState(false);
  const { showSuccess, showError } = useToast();

  const loadData = async () => {
    try {
      setLoading(true);
      const [parts, allEvents, allOrphs] = await Promise.all([
        eventsApi.getMyParticipations(),
        eventsApi.list(),
        orphanagesApi.list(),
      ]);

      setParticipations(parts || []);

      const eMap = {};
      if (allEvents && Array.isArray(allEvents)) {
        allEvents.forEach((e) => {
          eMap[e.id] = e;
        });
      }
      setEventsMap(eMap);

      const oMap = {};
      if (allOrphs && Array.isArray(allOrphs)) {
        allOrphs.forEach((o) => {
          oMap[o.id] = o;
        });
      }
      setOrphanagesMap(oMap);
    } catch (err) {
      showError(err.message || 'Failed to load your event participations.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCancelParticipation = async () => {
    if (!cancellingEventId) return;
    try {
      setCancelling(true);
      await eventsApi.cancelParticipation(cancellingEventId);
      showSuccess('Participation cancelled successfully.');
      setCancellingEventId(null);
      await loadData();
    } catch (err) {
      showError(err.message || 'Failed to cancel participation.');
    } finally {
      setCancelling(false);
    }
  };

  if (loading) {
    return <LoadingState message="Loading your event participations..." />;
  }

  const upcomingCount = participations.filter((p) => {
    const ev = eventsMap[p.event_id];
    if (!ev) return false;
    return new Date(ev.event_date) > new Date();
  }).length;

  return (
    <div className="space-y-6 animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 className="text-3xl font-bold text-main">My Event Participations</h1>
          <p className="text-muted" style={{ marginTop: '0.25rem' }}>
            Review and manage the community activities and orphanage drives you have signed up for.
          </p>
        </div>
        <Link to="/events" className="btn btn-primary">
          <Calendar size={16} />
          Explore Events
        </Link>
      </div>

      {/* Metrics */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(14rem, 1fr))', gap: '1rem' }}>
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div
            style={{
              padding: '0.75rem',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--primary-light)',
              color: 'var(--primary)',
            }}
          >
            <Calendar size={24} />
          </div>
          <div>
            <p className="text-xs text-muted font-bold" style={{ textTransform: 'uppercase' }}>
              Total Registered
            </p>
            <p className="text-2xl font-bold text-main">{participations.length}</p>
          </div>
        </div>

        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div
            style={{
              padding: '0.75rem',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--success-bg)',
              color: 'var(--success)',
            }}
          >
            <Clock size={24} />
          </div>
          <div>
            <p className="text-xs text-muted font-bold" style={{ textTransform: 'uppercase' }}>
              Upcoming Drives
            </p>
            <p className="text-2xl font-bold text-main">{upcomingCount}</p>
          </div>
        </div>
      </div>

      {/* Participations List */}
      {participations.length === 0 ? (
        <EmptyState
          icon={Calendar}
          title="No event sign-ups yet"
          description="Orphanages regularly host mentoring sessions, arts workshops, and festive celebrations. Join one to make an impact!"
          action={
            <Link to="/events" className="btn btn-primary">
              <Sparkles size={16} />
              Browse Volunteer Events
            </Link>
          }
        />
      ) : (
        <div className="space-y-4">
          {participations.map((part) => {
            const ev = eventsMap[part.event_id];
            const orph = ev ? orphanagesMap[ev.orphanage_id] : null;
            const isUpcoming = ev ? new Date(ev.event_date) > new Date() : false;

            return (
              <div
                key={part.id}
                className="card"
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '1.25rem',
                }}
              >
                <div style={{ flex: '1 1 20rem', minWidth: '18rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                    <h2 className="text-lg font-bold text-main">
                      {ev ? (
                        <Link to={`/events/${ev.id}`} className="hover:text-primary">
                          {ev.title}
                        </Link>
                      ) : (
                        `Event #${part.event_id}`
                      )}
                    </h2>
                    <StatusBadge status={part.status} />
                  </div>

                  {ev && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', marginTop: '0.5rem', fontSize: '0.875rem' }} className="text-secondary">
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                        <Calendar size={15} className="text-primary" />
                        <span>
                          {new Date(ev.event_date).toLocaleDateString(undefined, {
                            weekday: 'short',
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>

                      {ev.location && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                          <MapPin size={15} className="text-secondary" />
                          <span>{ev.location}</span>
                        </div>
                      )}

                      {orph && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                          <Building2 size={15} className="text-muted" />
                          <Link to={`/orphanages/${orph.id}`} className="hover:underline">
                            {orph.name}
                          </Link>
                        </div>
                      )}
                    </div>
                  )}

                  <p className="text-xs text-muted" style={{ marginTop: '0.5rem' }}>
                    Registered on{' '}
                    {new Date(part.joined_at).toLocaleDateString(undefined, {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </p>
                </div>

                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                  {ev && (
                    <Link to={`/events/${ev.id}`} className="btn btn-outline btn-sm">
                      <ExternalLink size={14} />
                      Event Details
                    </Link>
                  )}

                  {isUpcoming && (
                    <button
                      type="button"
                      onClick={() => setCancellingEventId(part.event_id)}
                      className="btn btn-sm"
                      style={{
                        backgroundColor: 'var(--danger-bg)',
                        color: 'var(--danger)',
                        border: '1px solid var(--danger-border)',
                      }}
                    >
                      <UserX size={14} />
                      Cancel Registration
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Confirmation Dialog */}
      <ConfirmDialog
        isOpen={Boolean(cancellingEventId)}
        title="Cancel Participation"
        message="Are you sure you want to cancel your attendance for this event? Organizers rely on accurate volunteer headcounts."
        confirmText="Yes, Cancel Attendance"
        cancelText="Keep Participation"
        confirmVariant="danger"
        loading={cancelling}
        onConfirm={handleCancelParticipation}
        onClose={() => setCancellingEventId(null)}
      />
    </div>
  );
}
