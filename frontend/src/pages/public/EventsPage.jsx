import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { eventsApi } from '../../api/events';
import { StatusBadge } from '../../components/common/StatusBadge';
import { LoadingState } from '../../components/common/LoadingState';
import { EmptyState } from '../../components/common/EmptyState';
import { ErrorState } from '../../components/common/ErrorState';
import { Calendar, MapPin, Search, Filter, ArrowRight } from 'lucide-react';

export function EventsPage() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('upcoming');
  const [searchTerm, setSearchTerm] = useState('');

  const loadEvents = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await eventsApi.list({ status: statusFilter || undefined });
      setEvents(data);
    } catch (err) {
      setError(err.message || 'Failed to load community events.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEvents();
  }, [statusFilter]);

  const filtered = events.filter((ev) => {
    const term = searchTerm.toLowerCase();
    return (
      ev.title.toLowerCase().includes(term) ||
      (ev.location && ev.location.toLowerCase().includes(term)) ||
      (ev.description && ev.description.toLowerCase().includes(term))
    );
  });

  return (
    <div className="max-w-7xl" style={{ padding: '2.5rem 1.5rem' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 className="text-3xl font-extrabold text-main" style={{ marginBottom: '0.375rem' }}>
          Volunteer & Community Events
        </h1>
        <p className="text-secondary text-base">
          Join hands with local care homes. Offer your time, mentorship, tutoring, and support to bring joy to children.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div
        className="card"
        style={{
          padding: '1rem 1.25rem',
          marginBottom: '2rem',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '1rem',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ position: 'relative', flex: '1 1 18rem' }}>
          <Search
            size={18}
            style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}
          />
          <input
            type="text"
            className="form-input"
            style={{ paddingLeft: '2.5rem' }}
            placeholder="Search events by title, city, or keywords..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            <Filter size={16} />
            <span>Status:</span>
          </div>
          <select
            className="form-select"
            style={{ width: 'auto', minWidth: '10rem' }}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All Events</option>
            <option value="upcoming">Upcoming Only</option>
            <option value="completed">Past / Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <LoadingState message="Loading events calendar..." />
      ) : error ? (
        <ErrorState message={error} onRetry={loadEvents} />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={Calendar}
          title="No events scheduled"
          description={searchTerm ? `No events matching "${searchTerm}".` : 'No events found matching the selected filter.'}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((ev) => (
            <div key={ev.id} className="card card-hover" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                  <StatusBadge status={ev.status} />
                  <span className="text-xs font-semibold text-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <Calendar size={13} />
                    {new Date(ev.event_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-main" style={{ marginBottom: '0.375rem' }}>
                  {ev.title}
                </h3>

                <p className="text-secondary text-xs" style={{ marginBottom: '1rem', lineHeight: '1.5' }}>
                  {ev.description || 'Community gathering and activities.'}
                </p>

                {ev.location && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', color: 'var(--text-secondary)', fontSize: '0.8125rem' }}>
                    <MapPin size={14} className="text-teal" />
                    <span>{ev.location}</span>
                  </div>
                )}
              </div>

              <div style={{ borderTop: '1px solid var(--border)', paddingTop: '0.875rem', marginTop: '1.25rem' }}>
                <Link to={`/events/${ev.id}`} className="btn btn-primary btn-sm" style={{ width: '100%' }}>
                  View Event Details
                  <ArrowRight size={14} />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
