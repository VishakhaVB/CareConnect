import { useState, useEffect } from 'react';
import { impactStoriesApi } from '../../api/impactStories';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { LoadingState } from '../../components/common/LoadingState';
import { EmptyState } from '../../components/common/EmptyState';
import { Modal } from '../../components/common/Modal';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import {
  FileText,
  Plus,
  Edit2,
  Trash2,
  Calendar,
  Image as ImageIcon,
  Sparkles,
} from 'lucide-react';

const INITIAL_STORY_FORM = {
  title: '',
  content: '',
  image_url: '',
};

export function ManageStoriesPage() {
  const { orphanage } = useAuth();
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingStory, setEditingStory] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState(INITIAL_STORY_FORM);

  const { showSuccess, showError } = useToast();

  const loadStories = async () => {
    if (!orphanage) return;
    try {
      setLoading(true);
      const data = await impactStoriesApi.list(orphanage.id);
      setStories(data || []);
    } catch (err) {
      showError(err.message || 'Failed to load impact stories.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStories();
  }, [orphanage]);

  const handleOpenCreate = () => {
    setFormData(INITIAL_STORY_FORM);
    setIsCreateOpen(true);
  };

  const handleOpenEdit = (story) => {
    setEditingStory(story);
    setFormData({
      title: story.title,
      content: story.content,
      image_url: story.image_url || '',
    });
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.content.trim()) {
      showError('Please provide both a title and the story content.');
      return;
    }

    setSubmitting(true);
    try {
      if (editingStory) {
        // Update
        await impactStoriesApi.update(editingStory.id, {
          title: formData.title.trim(),
          content: formData.content.trim(),
          image_url: formData.image_url.trim() || null,
        });
        showSuccess('Impact story updated successfully!');
        setEditingStory(null);
      } else {
        // Create
        await impactStoriesApi.create({
          title: formData.title.trim(),
          content: formData.content.trim(),
          image_url: formData.image_url.trim() || null,
        });
        showSuccess('New impact story published!');
        setIsCreateOpen(false);
      }
      await loadStories();
    } catch (err) {
      showError(err.message || 'Failed to save impact story.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    try {
      setSubmitting(true);
      await impactStoriesApi.delete(deletingId);
      showSuccess('Story removed successfully.');
      setDeletingId(null);
      await loadStories();
    } catch (err) {
      showError(err.message || 'Failed to delete story.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <LoadingState message="Loading impact stories..." />;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 className="text-3xl font-bold text-main">Impact Stories</h1>
          <p className="text-muted" style={{ marginTop: '0.25rem' }}>
            Share real-world updates on how donor contributions and volunteer hours have transformed lives.
          </p>
        </div>
        <button type="button" onClick={handleOpenCreate} className="btn btn-primary">
          <Plus size={16} />
          Publish Story
        </button>
      </div>

      {stories.length === 0 ? (
        <EmptyState
          icon={Sparkles}
          title="No impact stories published yet"
          description="Show donors the difference their gifts make—celebrate academic achievements, renovated playrooms, or holiday joy."
          action={
            <button type="button" onClick={handleOpenCreate} className="btn btn-primary">
              <Plus size={16} />
              Publish Your First Story
            </button>
          }
        />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(20rem, 1fr))', gap: '1.5rem' }}>
          {stories.map((story) => (
            <div key={story.id} className="card" style={{ display: 'flex', flexDirection: 'column', padding: 0, overflow: 'hidden' }}>
              {story.image_url ? (
                <div style={{ height: '12rem', width: '100%', overflow: 'hidden', backgroundColor: 'var(--bg-subtle)' }}>
                  <img
                    src={story.image_url}
                    alt={story.title}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                </div>
              ) : (
                <div
                  style={{
                    height: '6rem',
                    backgroundColor: 'var(--primary-light)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--primary)',
                  }}
                >
                  <FileText size={28} />
                </div>
              )}

              <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', color: 'var(--text-muted)', fontSize: '0.75rem', marginBottom: '0.5rem' }}>
                  <Calendar size={13} />
                  <span>
                    {new Date(story.created_at).toLocaleDateString(undefined, {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </span>
                </div>

                <h3 className="font-bold text-main text-lg" style={{ marginBottom: '0.5rem' }}>
                  {story.title}
                </h3>

                <p className="text-secondary text-sm" style={{ flex: 1, whiteSpace: 'pre-line', marginBottom: '1.25rem' }}>
                  {story.content.length > 220
                    ? `${story.content.substring(0, 220)}...`
                    : story.content}
                </p>

                <div style={{ borderTop: '1px solid var(--border)', paddingTop: '0.875rem', display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                  <button
                    type="button"
                    onClick={() => handleOpenEdit(story)}
                    className="btn btn-outline btn-sm"
                  >
                    <Edit2 size={14} />
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeletingId(story.id)}
                    className="btn btn-sm"
                    style={{
                      backgroundColor: 'var(--danger-bg)',
                      color: 'var(--danger)',
                      border: '1px solid var(--danger-border)',
                    }}
                  >
                    <Trash2 size={14} />
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create / Edit Modal */}
      <Modal
        isOpen={isCreateOpen || Boolean(editingStory)}
        onClose={() => {
          setIsCreateOpen(false);
          setEditingStory(null);
        }}
        title={editingStory ? 'Edit Impact Story' : 'Share an Impact Story'}
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div className="form-group">
            <label className="form-label" htmlFor="story_title">
              Story Headline <span className="text-danger">*</span>
            </label>
            <input
              id="story_title"
              type="text"
              name="title"
              value={formData.title}
              onChange={handleFormChange}
              placeholder="e.g. Thanks to your support, 35 children have new school supplies!"
              maxLength={150}
              required
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="story_img">
              Cover Image URL (Optional)
            </label>
            <input
              id="story_img"
              type="url"
              name="image_url"
              value={formData.image_url}
              onChange={handleFormChange}
              placeholder="https://example.com/images/story-photo.jpg"
              maxLength={500}
              className="form-input"
            />
            <p className="text-xs text-muted" style={{ marginTop: '0.25rem' }}>
              Paste a public image link to give your story a visual cover.
            </p>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="story_content">
              Story Content <span className="text-danger">*</span>
            </label>
            <textarea
              id="story_content"
              name="content"
              value={formData.content}
              onChange={handleFormChange}
              rows={6}
              placeholder="Describe the milestone or moment of joy made possible by donors..."
              required
              className="form-textarea"
            />
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', paddingTop: '1rem', borderTop: '1px solid var(--border)' }}>
            <button
              type="button"
              onClick={() => {
                setIsCreateOpen(false);
                setEditingStory(null);
              }}
              className="btn btn-outline"
              disabled={submitting}
            >
              Cancel
            </button>
            <button type="submit" disabled={submitting} className="btn btn-primary">
              {submitting ? 'Saving...' : editingStory ? 'Update Story' : 'Publish Story'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={Boolean(deletingId)}
        title="Delete Story"
        message="Are you sure you want to remove this impact story? It will no longer appear on your public profile."
        confirmText="Yes, Delete Story"
        cancelText="Cancel"
        confirmVariant="danger"
        loading={submitting}
        onConfirm={handleDelete}
        onClose={() => setDeletingId(null)}
      />
    </div>
  );
}
