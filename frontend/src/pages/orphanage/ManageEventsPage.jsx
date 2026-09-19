import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { eventsApi } from '../../api/events';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { LoadingState } from '../../components/common/LoadingState';
import { EmptyState } from '../../components/common/EmptyState';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Modal } from '../../components/common/Modal';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import {
  Calendar,
  Plus,
  Edit2,
  Trash2,
  MapPin,
  Clock,
  Search,
  ExternalLink,
} from 'lucide-react';

const INITIAL_EVENT_FORM = {
  title: '',
  description: '',
  event_date: '',
  location: '',
  status: 'upcoming',
};

export function ManageEventsPage() {
  const { orphanage } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Modals state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState(INITIAL_EVENT_FORM);

  const { showSuccess, showError } = useToast();

  const loadEvents = async () => {
    if (!orphanage) return;
    try {
      setLoading(true);
      const data = await eventsApi.list({ orphanageId: orphanage.id });
      setEvents(data || []);
    } catch (err) {
      showError(err.message || 'Failed to load events.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEvents();
  }, [orphanage]);

  const handleOpenCreate = () => {
    // Default event date to tomorrow at 10:00 AM
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(10, 0, 0, 0);
    const dateStr = tomorrow.toISOString().slice(0, 16);

    setFormData({
      ...INITIAL_EVENT_FORM,
      event_date: dateStr,
      location: orphanage?.address || '',
    });
    setIsCreateOpen(true);
  };

  const handleOpenEdit = (ev) => {
    setEditingEvent(ev);
    // Format date string for datetime-local
    const dt = new Date(ev.event_date);
    const dateStr = dt.toISOString().slice(0, 16);

    setFormData({
      title: ev.title,
      description: ev.description || '',
      event_date: dateStr,
      location: ev.location || '',
      status: ev.status || 'upcoming',
    });
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.event_date) {
      showError('Please enter an event title and select a date & time.');
      return;
    }

    setSubmitting(true);
    try {
      const isoDate = new Date(formData.event_date).toISOString();

      if (editingEvent) {
        // Update
        await eventsApi.update(editingEvent.id, {
          title: formData.title.trim(),
          description: formData.description.trim() || null,
          event_date: isoDate,
          location: formData.location.trim() || null,
          status: formData.status,
        });
        showSuccess('Event updated successfully!');
        setEditingEvent(null);
      } else {
        // Create
        await eventsApi.create({
          title: formData.title.trim(),
          description: formData.description.trim() || null,
          event_date: isoDate,
          location: formData.location.trim() || null,
          status: formData.status,
        });
        showSuccess('New event scheduled and published!');
        setIsCreateOpen(false);
      }
      await loadEvents();
    } catch (err) {
      showError(err.message || 'Failed to save event.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    try {
      setSubmitting(true);
      await eventsApi.delete(deletingId);
      showSuccess('Event deleted successfully.');
      setDeletingId(null);
      await loadEvents();
    } catch (err) {
      showError(err.message || 'Failed to delete event.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <LoadingState message="Loading events..." />;
  }

  const filteredEvents = events.filter((ev) => {
    return (
      ev.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (ev.location && ev.location.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  });

  return (
    <div className="space-y-6 animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 className="text-3xl font-bold text-main">Manage Events & Drives</h1>
          <p className="text-muted" style={{ marginTop: '0.25rem' }}>
            Organize mentoring days, arts camps, holiday feasts, and invite community volunteers.
          </p>
        </div>
        <button type="button" onClick={handleOpenCreate} className="btn btn-primary">
          <Plus size={16} />
          Create New Event
        </button>
      </div>

      {/* Search */}
      <div className="card" style={{ padding: '1rem 1.25rem' }}>
        <div style={{ position: 'relative', maxWidth: '24rem' }}>
          <Search
            size={18}
            style={{
              position: 'absolute',
              left: '0.875rem',
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--text-muted)',
            }}
          />
          <input
            type="text"
            placeholder="Search events by title or location..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input"
            style={{ paddingLeft: '2.5rem' }}
          />
        </div>
      </div>

      {/* Events List */}
      {filteredEvents.length === 0 ? (
        <EmptyState
          icon={Calendar}
          title={events.length === 0 ? 'No events scheduled yet' : 'No matching events found'}
          description={
            events.length === 0
              ? 'Schedule your first volunteer workshop, holiday lunch, or career mentoring session.'
              : 'Try adjusting your search criteria.'
          }
          action={
            events.length === 0 && (
              <button type="button" onClick={handleOpenCreate} className="btn btn-primary">
                <Plus size={16} />
                Create First Event
              </button>
            )
          }
        />
      ) : (
        <div className="space-y-4">
          {filteredEvents.map((ev) => (
            <div
              key={ev.id}
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
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
                  <h2 className="text-lg font-bold text-main">{ev.title}</h2>
                  <StatusBadge status={ev.status} />
                </div>

                {ev.description && (
                  <p className="text-sm text-secondary" style={{ marginTop: '0.25rem', maxWidth: '36rem' }}>
                    {ev.description}
                  </p>
                )}

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.25rem', marginTop: '0.75rem', fontSize: '0.875rem' }} className="text-secondary">
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
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <Link to={`/events/${ev.id}`} className="btn btn-outline btn-sm">
                  <ExternalLink size={14} />
                  Public Page
                </Link>
                <button
                  type="button"
                  onClick={() => handleOpenEdit(ev)}
                  className="btn btn-outline btn-sm"
                  title="Edit Event"
                >
                  <Edit2 size={14} />
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => setDeletingId(ev.id)}
                  className="btn btn-sm"
                  style={{
                    backgroundColor: 'var(--danger-bg)',
                    color: 'var(--danger)',
                    border: '1px solid var(--danger-border)',
                  }}
                  title="Delete Event"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create / Edit Modal */}
      <Modal
        isOpen={isCreateOpen || Boolean(editingEvent)}
        onClose={() => {
          setIsCreateOpen(false);
          setEditingEvent(null);
        }}
        title={editingEvent ? 'Edit Event' : 'Schedule New Event'}
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div className="form-group">
            <label className="form-label" htmlFor="ev_title">
              Event Title <span className="text-danger">*</span>
            </label>
            <input
              id="ev_title"
              type="text"
              name="title"
              value={formData.title}
              onChange={handleFormChange}
              placeholder="e.g. Weekend Painting & Arts Workshop"
              maxLength={150}
              required
              className="form-input"
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label" htmlFor="ev_date">
                Date & Time <span className="text-danger">*</span>
              </label>
              <input
                id="ev_date"
                type="datetime-local"
                name="event_date"
                value={formData.event_date}
                onChange={handleFormChange}
                required
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="ev_status">
                Event Status
              </label>
              <select
                id="ev_status"
                name="status"
                value={formData.status}
                onChange={handleFormChange}
                className="form-select"
              >
                <option value="upcoming">Upcoming</option>
                <option value="ongoing">Ongoing</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="ev_location">
              Event Location
            </label>
            <input
              id="ev_location"
              type="text"
              name="location"
              value={formData.location}
              onChange={handleFormChange}
              placeholder="e.g. Hope Haven Main Courtyard or Virtual Link"
              maxLength={255}
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="ev_desc">
              Event Description & Volunteer Roles
            </label>
            <textarea
              id="ev_desc"
              name="description"
              value={formData.description}
              onChange={handleFormChange}
              rows={4}
              placeholder="Explain the activities planned, age group of children, and what volunteers should bring..."
              className="form-textarea"
            />
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', paddingTop: '1rem', borderTop: '1px solid var(--border)' }}>
            <button
              type="button"
              onClick={() => {
                setIsCreateOpen(false);
                setEditingEvent(null);
              }}
              className="btn btn-outline"
              disabled={submitting}
            >
              Cancel
            </button>
            <button type="submit" disabled={submitting} className="btn btn-primary">
              {submitting ? 'Saving...' : editingEvent ? 'Save Event' : 'Schedule Event'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={Boolean(deletingId)}
        title="Delete Event"
        message="Are you sure you want to delete this event? Registered volunteers will be affected."
        confirmText="Yes, Delete Event"
        cancelText="Cancel"
        confirmVariant="danger"
        loading={submitting}
        onConfirm={handleDelete}
        onClose={() => setDeletingId(null)}
      />
    </div>
  );
}
