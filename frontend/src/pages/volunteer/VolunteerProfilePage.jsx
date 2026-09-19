import { useState, useEffect } from 'react';
import { volunteersApi } from '../../api/volunteers';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { LoadingState } from '../../components/common/LoadingState';
import {
  UserCheck,
  Calendar,
  MapPin,
  Sparkles,
  Edit3,
  CheckCircle2,
  AlertCircle,
  Save,
  X,
} from 'lucide-react';

export function VolunteerProfilePage() {
  const { user } = useAuth();
  const { showSuccess, showError } = useToast();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    skills: '',
    availability: '',
    location: '',
  });

  const loadProfile = async () => {
    try {
      setLoading(true);
      const data = await volunteersApi.getMyProfile();
      setProfile(data);
      setFormData({
        skills: data.skills || '',
        availability: data.availability || '',
        location: data.location || '',
      });
    } catch (err) {
      if (err.status === 404) {
        setProfile(null);
      } else {
        showError(err.message || 'Failed to load volunteer profile.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (profile) {
        // Update existing profile
        const updated = await volunteersApi.updateMyProfile({
          skills: formData.skills || null,
          availability: formData.availability || null,
          location: formData.location || null,
        });
        setProfile(updated);
        setIsEditing(false);
        showSuccess('Volunteer profile updated successfully!');
      } else {
        // Create new profile
        const created = await volunteersApi.createProfile({
          skills: formData.skills || null,
          availability: formData.availability || null,
          location: formData.location || null,
        });
        setProfile(created);
        showSuccess('Volunteer profile registered successfully!');
      }
    } catch (err) {
      showError(err.message || 'Failed to save volunteer profile.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <LoadingState message="Loading your volunteer details..." />;
  }

  const skillsList = profile?.skills
    ? profile.skills.split(',').map((s) => s.trim()).filter(Boolean)
    : [];

  return (
    <div className="space-y-6 animate-fade-in" style={{ maxWidth: '44rem', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 className="text-3xl font-bold text-main">Volunteer Profile</h1>
          <p className="text-muted" style={{ marginTop: '0.25rem' }}>
            Highlight your skills and availability to connect with local orphanage events.
          </p>
        </div>

        {profile && !isEditing && (
          <button
            type="button"
            onClick={() => setIsEditing(true)}
            className="btn btn-outline btn-sm"
          >
            <Edit3 size={16} />
            Edit Profile
          </button>
        )}
      </div>

      {/* When no profile exists or user is editing */}
      {(!profile || isEditing) ? (
        <form onSubmit={handleSubmit} className="card space-y-5">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
            <div
              style={{
                width: '2.5rem',
                height: '2.5rem',
                borderRadius: 'var(--radius-full)',
                backgroundColor: 'var(--primary-light)',
                color: 'var(--primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <UserCheck size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-main">
                {profile ? 'Edit Volunteer Information' : 'Setup Volunteer Profile'}
              </h2>
              <p className="text-xs text-muted">
                {profile
                  ? 'Keep your availability and skills updated for organizers'
                  : 'Tell orphanages how you can assist their upcoming events'}
              </p>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="skills">
              Skills & Expertise <span className="text-muted font-normal">(Comma-separated)</span>
            </label>
            <input
              id="skills"
              type="text"
              name="skills"
              value={formData.skills}
              onChange={handleChange}
              placeholder="e.g. Teaching, Art & Crafts, Cooking, First Aid, Sports Coaching"
              className="form-input"
            />
            <p className="text-xs text-muted" style={{ marginTop: '0.375rem' }}>
              Add subjects, talents, or practical skills you want to share with children.
            </p>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="availability">
              Availability
            </label>
            <input
              id="availability"
              type="text"
              name="availability"
              value={formData.availability}
              onChange={handleChange}
              placeholder="e.g. Weekends only, Saturday mornings, Flexible on weekdays"
              maxLength={100}
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="location">
              Preferred Location / Area
            </label>
            <input
              id="location"
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              placeholder="e.g. Downtown Metro, South District, Within 15 km"
              maxLength={150}
              className="form-input"
            />
          </div>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', paddingTop: '1rem', borderTop: '1px solid var(--border)' }}>
            {profile && (
              <button
                type="button"
                onClick={() => {
                  setIsEditing(false);
                  setFormData({
                    skills: profile.skills || '',
                    availability: profile.availability || '',
                    location: profile.location || '',
                  });
                }}
                className="btn btn-outline"
                disabled={submitting}
              >
                <X size={16} />
                Cancel
              </button>
            )}
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? (
                'Saving...'
              ) : (
                <>
                  <Save size={16} />
                  {profile ? 'Save Changes' : 'Register Profile'}
                </>
              )}
            </button>
          </div>
        </form>
      ) : (
        /* Profile Display View */
        <div className="card space-y-6">
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div
              style={{
                width: '3.5rem',
                height: '3.5rem',
                borderRadius: 'var(--radius-full)',
                backgroundColor: 'var(--accent-light)',
                color: 'var(--secondary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.5rem',
                fontWeight: 700,
              }}
            >
              {user?.name ? user.name[0].toUpperCase() : 'V'}
            </div>
            <div>
              <h2 className="text-xl font-bold text-main">{user?.name}</h2>
              <p className="text-sm text-muted">{user?.email}</p>
              <div style={{ marginTop: '0.25rem', display: 'flex', gap: '0.5rem' }}>
                <span className="badge badge-verified">Active Volunteer</span>
              </div>
            </div>
          </div>

          <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1.25rem' }} className="space-y-4">
            <div>
              <p className="text-xs text-muted font-bold uppercase tracking-wider" style={{ marginBottom: '0.5rem' }}>
                Registered Skills & Interests
              </p>
              {skillsList.length > 0 ? (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                  {skillsList.map((skill, index) => (
                    <span
                      key={index}
                      className="badge badge-info"
                      style={{ fontSize: '0.8125rem', padding: '0.35rem 0.75rem' }}
                    >
                      <Sparkles size={13} />
                      {skill}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted italic">No skills listed yet.</p>
              )}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', paddingTop: '0.5rem' }}>
              <div>
                <p className="text-xs text-muted font-bold uppercase tracking-wider" style={{ marginBottom: '0.25rem' }}>
                  Availability
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-main)' }}>
                  <Calendar size={16} className="text-primary" />
                  <span className="text-sm font-medium">
                    {profile.availability || 'Not specified'}
                  </span>
                </div>
              </div>

              <div>
                <p className="text-xs text-muted font-bold uppercase tracking-wider" style={{ marginBottom: '0.25rem' }}>
                  Preferred Location
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-main)' }}>
                  <MapPin size={16} className="text-secondary" />
                  <span className="text-sm font-medium">
                    {profile.location || 'Any location'}
                  </span>
                </div>
              </div>
            </div>

            <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <p className="text-xs text-muted">
                Member since{' '}
                {new Date(profile.created_at).toLocaleDateString(undefined, {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'var(--success)', fontSize: '0.75rem', fontWeight: 600 }}>
                <CheckCircle2 size={14} />
                Profile Active
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
