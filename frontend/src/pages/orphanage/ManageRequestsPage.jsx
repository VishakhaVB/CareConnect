import { useState, useEffect } from 'react';
import { requestsApi } from '../../api/requests';
import { useToast } from '../../context/ToastContext';
import { LoadingState } from '../../components/common/LoadingState';
import { EmptyState } from '../../components/common/EmptyState';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Modal } from '../../components/common/Modal';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import {
  Package,
  Plus,
  Edit2,
  Trash2,
  Search,
  Filter,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';

const INITIAL_FORM = {
  title: '',
  description: '',
  item_type: 'Clothing',
  quantity_needed: '10',
  urgency: 'normal',
  status: 'open',
};

const ITEM_CATEGORIES = [
  'Clothing',
  'Food & Nutrition',
  'Books & Education',
  'Bedding & Blankets',
  'Hygiene & Sanitation',
  'Toys & Recreation',
  'Medical & First Aid',
  'Other Essential Supplies',
];

export function ManageRequestsPage() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterUrgency, setFilterUrgency] = useState('all');

  // Modals state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingRequest, setEditingRequest] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState(INITIAL_FORM);

  const { showSuccess, showError } = useToast();

  const loadRequests = async () => {
    try {
      setLoading(true);
      const data = await requestsApi.getMyRequests();
      setRequests(data || []);
    } catch (err) {
      showError(err.message || 'Failed to load your requests.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, []);

  const handleOpenCreate = () => {
    setFormData(INITIAL_FORM);
    setIsCreateOpen(true);
  };

  const handleOpenEdit = (req) => {
    setEditingRequest(req);
    setFormData({
      title: req.title,
      description: req.description || '',
      item_type: req.item_type,
      quantity_needed: String(req.quantity_needed),
      urgency: req.urgency,
      status: req.status,
    });
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.item_type.trim()) {
      showError('Please provide a title and item category.');
      return;
    }

    const qty = parseInt(formData.quantity_needed, 10);
    if (!qty || qty <= 0) {
      showError('Quantity needed must be greater than 0.');
      return;
    }

    setSubmitting(true);
    try {
      if (editingRequest) {
        // Update
        await requestsApi.update(editingRequest.id, {
          title: formData.title.trim(),
          description: formData.description.trim() || null,
          item_type: formData.item_type.trim(),
          quantity_needed: qty,
          urgency: formData.urgency,
          status: formData.status,
        });
        showSuccess('Request updated successfully!');
        setEditingRequest(null);
      } else {
        // Create
        await requestsApi.create({
          title: formData.title.trim(),
          description: formData.description.trim() || null,
          item_type: formData.item_type.trim(),
          quantity_needed: qty,
          urgency: formData.urgency,
        });
        showSuccess('New item request published!');
        setIsCreateOpen(false);
      }
      await loadRequests();
    } catch (err) {
      showError(err.message || 'Failed to save item request.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    try {
      setSubmitting(true);
      await requestsApi.delete(deletingId);
      showSuccess('Request deleted successfully.');
      setDeletingId(null);
      await loadRequests();
    } catch (err) {
      showError(err.message || 'Failed to delete request.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <LoadingState message="Loading orphanage item requests..." />;
  }

  const filteredRequests = requests.filter((r) => {
    const matchesUrgency = filterUrgency === 'all' || r.urgency === filterUrgency;
    const matchesSearch =
      r.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.item_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (r.description && r.description.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesUrgency && matchesSearch;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 className="text-3xl font-bold text-main">Manage Item Requests</h1>
          <p className="text-muted" style={{ marginTop: '0.25rem' }}>
            Publish physical item needs so community donors can send supplies directly to your children.
          </p>
        </div>
        <button type="button" onClick={handleOpenCreate} className="btn btn-primary">
          <Plus size={16} />
          Create Need Request
        </button>
      </div>

      {/* Controls & Search */}
      <div className="card" style={{ padding: '1rem 1.25rem' }}>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ position: 'relative', flex: '1 1 18rem', maxWidth: '24rem' }}>
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
              placeholder="Search by title, item type..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input"
              style={{ paddingLeft: '2.5rem' }}
            />
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <Filter size={16} className="text-muted" />
            {['all', 'critical', 'high', 'normal', 'low'].map((urg) => (
              <button
                key={urg}
                type="button"
                onClick={() => setFilterUrgency(urg)}
                className={`btn btn-sm capitalize ${filterUrgency === urg ? 'btn-primary' : 'btn-outline'}`}
              >
                {urg}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Requests Table / List */}
      {filteredRequests.length === 0 ? (
        <EmptyState
          icon={Package}
          title={requests.length === 0 ? 'No requests created yet' : 'No matching requests found'}
          description={
            requests.length === 0
              ? 'Tell donors what your orphanage currently needs—from textbooks and winter clothes to food supplies.'
              : 'Try changing your search keywords or urgency filters.'
          }
          action={
            requests.length === 0 && (
              <button type="button" onClick={handleOpenCreate} className="btn btn-primary">
                <Plus size={16} />
                Create First Request
              </button>
            )
          }
        />
      ) : (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Title & Description</th>
                  <th>Category</th>
                  <th>Quantity Needed</th>
                  <th>Urgency</th>
                  <th>Status</th>
                  <th>Created</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredRequests.map((req) => (
                  <tr key={req.id}>
                    <td>
                      <p className="font-bold text-main">{req.title}</p>
                      {req.description && (
                        <p className="text-xs text-muted" style={{ maxWidth: '20rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {req.description}
                        </p>
                      )}
                    </td>
                    <td>
                      <span className="badge badge-info">{req.item_type}</span>
                    </td>
                    <td>
                      <span className="font-bold text-main">{req.quantity_needed}</span> units
                    </td>
                    <td>
                      <StatusBadge status={req.urgency} />
                    </td>
                    <td>
                      <StatusBadge status={req.status} />
                    </td>
                    <td className="text-sm text-secondary">
                      {new Date(req.created_at).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(req)}
                          className="btn btn-outline btn-sm"
                          title="Edit Request"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeletingId(req.id)}
                          className="btn btn-sm"
                          style={{
                            backgroundColor: 'var(--danger-bg)',
                            color: 'var(--danger)',
                            border: '1px solid var(--danger-border)',
                          }}
                          title="Delete Request"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create / Edit Modal */}
      <Modal
        isOpen={isCreateOpen || Boolean(editingRequest)}
        onClose={() => {
          setIsCreateOpen(false);
          setEditingRequest(null);
        }}
        title={editingRequest ? 'Edit Item Request' : 'Create Item Need Request'}
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div className="form-group">
            <label className="form-label" htmlFor="req_title">
              Request Title <span className="text-danger">*</span>
            </label>
            <input
              id="req_title"
              type="text"
              name="title"
              value={formData.title}
              onChange={handleFormChange}
              placeholder="e.g. 50 Winter Coats for Ages 6-14"
              maxLength={150}
              required
              className="form-input"
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label" htmlFor="req_item_type">
                Category / Item Type <span className="text-danger">*</span>
              </label>
              <select
                id="req_item_type"
                name="item_type"
                value={formData.item_type}
                onChange={handleFormChange}
                required
                className="form-select"
              >
                {ITEM_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="req_qty">
                Quantity Needed <span className="text-danger">*</span>
              </label>
              <input
                id="req_qty"
                type="number"
                name="quantity_needed"
                value={formData.quantity_needed}
                onChange={handleFormChange}
                min="1"
                required
                className="form-input"
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: editingRequest ? '1fr 1fr' : '1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label" htmlFor="req_urgency">
                Urgency Level
              </label>
              <select
                id="req_urgency"
                name="urgency"
                value={formData.urgency}
                onChange={handleFormChange}
                className="form-select"
              >
                <option value="low">Low Priority</option>
                <option value="normal">Normal</option>
                <option value="high">High Priority</option>
                <option value="critical">Critical / Urgent</option>
              </select>
            </div>

            {editingRequest && (
              <div className="form-group">
                <label className="form-label" htmlFor="req_status">
                  Status
                </label>
                <select
                  id="req_status"
                  name="status"
                  value={formData.status}
                  onChange={handleFormChange}
                  className="form-select"
                >
                  <option value="open">Open</option>
                  <option value="in_progress">In Progress</option>
                  <option value="fulfilled">Fulfilled</option>
                  <option value="closed">Closed</option>
                </select>
              </div>
            )}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="req_desc">
              Detailed Description
            </label>
            <textarea
              id="req_desc"
              name="description"
              value={formData.description}
              onChange={handleFormChange}
              rows={3}
              placeholder="Provide sizing, specifications, or preferred delivery dates..."
              className="form-textarea"
            />
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', paddingTop: '1rem', borderTop: '1px solid var(--border)' }}>
            <button
              type="button"
              onClick={() => {
                setIsCreateOpen(false);
                setEditingRequest(null);
              }}
              className="btn btn-outline"
              disabled={submitting}
            >
              Cancel
            </button>
            <button type="submit" disabled={submitting} className="btn btn-primary">
              {submitting ? 'Saving...' : editingRequest ? 'Update Request' : 'Publish Request'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={Boolean(deletingId)}
        title="Delete Item Request"
        message="Are you sure you want to delete this request? Donors will no longer be able to contribute toward it."
        confirmText="Yes, Delete Request"
        cancelText="Cancel"
        confirmVariant="danger"
        loading={submitting}
        onConfirm={handleDelete}
        onClose={() => setDeletingId(null)}
      />
    </div>
  );
}
