import { useState, useEffect } from 'react';
import { badgesApi } from '../../api/badges';
import { adminApi } from '../../api/admin';
import { useToast } from '../../context/ToastContext';
import { LoadingState } from '../../components/common/LoadingState';
import { EmptyState } from '../../components/common/EmptyState';
import { Modal } from '../../components/common/Modal';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import {
  Award,
  Plus,
  Edit2,
  Trash2,
  UserPlus,
  Sparkles,
  CheckCircle2,
  ShieldAlert,
} from 'lucide-react';

const INITIAL_BADGE_FORM = {
  name: '',
  description: '',
  icon: 'award',
};

export function AdminBadgesPage() {
  const [badges, setBadges] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingBadge, setEditingBadge] = useState(null);
  const [awardingBadge, setAwardingBadge] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Form states
  const [formData, setFormData] = useState(INITIAL_BADGE_FORM);
  const [selectedUserId, setSelectedUserId] = useState('');

  const { showSuccess, showError } = useToast();

  const loadData = async () => {
    try {
      setLoading(true);
      const [badgesData, usersData] = await Promise.all([
        badgesApi.list(),
        adminApi.getUsers().catch(() => []),
      ]);
      setBadges(badgesData || []);
      setUsers(usersData || []);
    } catch (err) {
      showError(err.message || 'Failed to load badges data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenCreate = () => {
    setFormData(INITIAL_BADGE_FORM);
    setIsCreateOpen(true);
  };

  const handleOpenEdit = (badge) => {
    setEditingBadge(badge);
    setFormData({
      name: badge.name,
      description: badge.description || '',
      icon: badge.icon || 'award',
    });
  };

  const handleOpenAward = (badge) => {
    setAwardingBadge(badge);
    setSelectedUserId(users.length > 0 ? String(users[0].id) : '');
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveBadge = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      showError('Please provide a badge name.');
      return;
    }

    setSubmitting(true);
    try {
      if (editingBadge) {
        // Update
        await adminApi.updateBadge(editingBadge.id, {
          name: formData.name.trim(),
          description: formData.description.trim() || null,
          icon: formData.icon.trim() || null,
        });
        showSuccess('Badge updated successfully!');
        setEditingBadge(null);
      } else {
        // Create
        await adminApi.createBadge({
          name: formData.name.trim(),
          description: formData.description.trim() || null,
          icon: formData.icon.trim() || null,
        });
        showSuccess('New badge created!');
        setIsCreateOpen(false);
      }
      await loadData();
    } catch (err) {
      showError(err.message || 'Failed to save badge.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteBadge = async () => {
    if (!deletingId) return;
    try {
      setSubmitting(true);
      await adminApi.deleteBadge(deletingId);
      showSuccess('Badge removed successfully.');
      setDeletingId(null);
      await loadData();
    } catch (err) {
      showError(err.message || 'Failed to delete badge.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAwardBadge = async (e) => {
    e.preventDefault();
    if (!awardingBadge || !selectedUserId) {
      showError('Please select a user to award this badge to.');
      return;
    }

    setSubmitting(true);
    try {
      await adminApi.awardBadge(awardingBadge.id, parseInt(selectedUserId, 10));
      const targetUser = users.find((u) => String(u.id) === String(selectedUserId));
      showSuccess(
        `Badge "${awardingBadge.name}" awarded to ${targetUser?.name || `User #${selectedUserId}`}!`
      );
      setAwardingBadge(null);
    } catch (err) {
      showError(err.message || 'Failed to award badge (user may already have it).');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <LoadingState message="Loading community badges..." />;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 className="text-3xl font-bold text-main">Badges & Recognition Management</h1>
          <p className="text-muted" style={{ marginTop: '0.25rem' }}>
            Configure community achievements and recognize remarkable donors and volunteers.
          </p>
        </div>
        <button type="button" onClick={handleOpenCreate} className="btn btn-primary">
          <Plus size={16} />
          Create New Badge
        </button>
      </div>

      {/* Badges Grid */}
      {badges.length === 0 ? (
        <EmptyState
          icon={Award}
          title="No badges configured yet"
          description="Create community badges like 'First Contributor', 'Super Volunteer', or 'Guardian Angel'."
          action={
            <button type="button" onClick={handleOpenCreate} className="btn btn-primary">
              <Plus size={16} />
              Create First Badge
            </button>
          }
        />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(18rem, 1fr))', gap: '1.25rem' }}>
          {badges.map((b) => (
            <div
              key={b.id}
              className="card"
              style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                  <div
                    style={{
                      width: '3rem',
                      height: '3rem',
                      borderRadius: 'var(--radius-full)',
                      backgroundColor: 'var(--accent-light)',
                      color: 'var(--secondary)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <Award size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-main text-base">{b.name}</h3>
                    <span className="font-mono text-xs text-muted">ID #{b.id}</span>
                  </div>
                </div>

                <p className="text-secondary text-sm" style={{ minHeight: '2.5rem' }}>
                  {b.description || 'Honoring community dedication and active generosity.'}
                </p>
              </div>

              <div
                style={{
                  borderTop: '1px solid var(--border)',
                  paddingTop: '1rem',
                  marginTop: '1.25rem',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <button
                  type="button"
                  onClick={() => handleOpenAward(b)}
                  className="btn btn-primary btn-sm"
                  title="Award this badge to a user"
                >
                  <UserPlus size={14} />
                  Award User
                </button>

                <div style={{ display: 'flex', gap: '0.375rem' }}>
                  <button
                    type="button"
                    onClick={() => handleOpenEdit(b)}
                    className="btn btn-outline btn-sm"
                    title="Edit Badge"
                  >
                    <Edit2 size={13} />
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeletingId(b.id)}
                    className="btn btn-sm"
                    style={{
                      backgroundColor: 'var(--danger-bg)',
                      color: 'var(--danger)',
                      border: '1px solid var(--danger-border)',
                    }}
                    title="Delete Badge"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create / Edit Badge Modal */}
      <Modal
        isOpen={isCreateOpen || Boolean(editingBadge)}
        onClose={() => {
          setIsCreateOpen(false);
          setEditingBadge(null);
        }}
        title={editingBadge ? 'Edit Badge' : 'Create New Community Badge'}
      >
        <form onSubmit={handleSaveBadge} className="space-y-4">
          <div className="form-group">
            <label className="form-label" htmlFor="badge_name">
              Badge Name <span className="text-danger">*</span>
            </label>
            <input
              id="badge_name"
              type="text"
              name="name"
              value={formData.name}
              onChange={handleFormChange}
              placeholder="e.g. Star Supporter, Holiday Hero, Top Mentor"
              maxLength={100}
              required
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="badge_desc">
              Badge Description
            </label>
            <textarea
              id="badge_desc"
              name="description"
              value={formData.description}
              onChange={handleFormChange}
              rows={3}
              placeholder="Criteria for earning this recognition..."
              className="form-textarea"
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="badge_icon">
              Icon Keyword
            </label>
            <input
              id="badge_icon"
              type="text"
              name="icon"
              value={formData.icon}
              onChange={handleFormChange}
              placeholder="e.g. award, heart, star, shield"
              maxLength={255}
              className="form-input"
            />
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', paddingTop: '1rem', borderTop: '1px solid var(--border)' }}>
            <button
              type="button"
              onClick={() => {
                setIsCreateOpen(false);
                setEditingBadge(null);
              }}
              className="btn btn-outline"
              disabled={submitting}
            >
              Cancel
            </button>
            <button type="submit" disabled={submitting} className="btn btn-primary">
              {submitting ? 'Saving...' : editingBadge ? 'Update Badge' : 'Create Badge'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Award Badge Modal */}
      <Modal
        isOpen={Boolean(awardingBadge)}
        onClose={() => setAwardingBadge(null)}
        title={`Award "${awardingBadge?.name}" Badge`}
      >
        <form onSubmit={handleAwardBadge} className="space-y-4">
          <p className="text-sm text-secondary">
            Select a community member to bestow this badge upon. A notification will be dispatched to their profile.
          </p>

          <div className="form-group">
            <label className="form-label" htmlFor="award_user">
              Select Recipient User <span className="text-danger">*</span>
            </label>
            <select
              id="award_user"
              value={selectedUserId}
              onChange={(e) => setSelectedUserId(e.target.value)}
              required
              className="form-select"
            >
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name} ({u.email}) — Role: {u.role}
                </option>
              ))}
            </select>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', paddingTop: '1rem', borderTop: '1px solid var(--border)' }}>
            <button
              type="button"
              onClick={() => setAwardingBadge(null)}
              className="btn btn-outline"
              disabled={submitting}
            >
              Cancel
            </button>
            <button type="submit" disabled={submitting} className="btn btn-primary">
              {submitting ? 'Bestowing...' : 'Award Badge'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={Boolean(deletingId)}
        title="Delete Badge"
        message="Are you sure you want to delete this badge? Any user assignments for this badge will also be removed."
        confirmText="Yes, Delete Badge"
        cancelText="Cancel"
        confirmVariant="danger"
        loading={submitting}
        onConfirm={handleDeleteBadge}
        onClose={() => setDeletingId(null)}
      />
    </div>
  );
}
