import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { orphanagesApi } from '../../api/orphanages';
import { requestsApi } from '../../api/requests';
import { donationsApi } from '../../api/donations';
import { useToast } from '../../context/ToastContext';
import { LoadingState } from '../../components/common/LoadingState';
import {
  Heart,
  DollarSign,
  Package,
  ArrowRight,
  Building2,
  AlertCircle,
  CheckCircle2,
  FileText,
} from 'lucide-react';

export function DonatePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { showSuccess, showError } = useToast();

  const queryParams = new URLSearchParams(location.search);
  const initialOrphanageId = location.state?.orphanageId || queryParams.get('orphanage_id') || '';
  const initialRequestId = location.state?.requestId || queryParams.get('request_id') || '';

  const [orphanages, setOrphanages] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    orphanage_id: initialOrphanageId ? String(initialOrphanageId) : '',
    request_id: initialRequestId ? String(initialRequestId) : '',
    donation_type: 'money', // 'money' | 'item'
    amount: '',
    item_description: '',
    quantity: '1',
  });

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        // Load verified orphanages first, or all if verified is empty
        const orphList = await orphanagesApi.list('verified');
        if (orphList && orphList.length > 0) {
          setOrphanages(orphList);
        } else {
          const allOrph = await orphanagesApi.list();
          setOrphanages(allOrph);
        }

        // If request ID is specified, load request details
        if (initialRequestId) {
          try {
            const req = await requestsApi.getById(initialRequestId);
            setSelectedRequest(req);
            setFormData((prev) => ({
              ...prev,
              orphanage_id: String(req.orphanage_id),
              request_id: String(req.id),
              donation_type: 'item',
              item_description: req.title,
              quantity: String(req.quantity_needed || 1),
            }));
          } catch (e) {
            console.error('Failed to load linked request', e);
          }
        }
      } catch (err) {
        showError('Failed to load orphanages list. Please try again.');
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [initialRequestId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.orphanage_id) {
      showError('Please select an orphanage to receive your donation.');
      return;
    }

    const payload = {
      orphanage_id: parseInt(formData.orphanage_id, 10),
      donation_type: formData.donation_type,
    };

    if (formData.request_id) {
      payload.request_id = parseInt(formData.request_id, 10);
    }

    if (formData.donation_type === 'money') {
      const amt = parseFloat(formData.amount);
      if (!amt || amt <= 0) {
        showError('Please enter a valid amount greater than 0.');
        return;
      }
      payload.amount = amt;
    } else {
      if (!formData.item_description.trim()) {
        showError('Please describe the items you wish to donate.');
        return;
      }
      const qty = parseInt(formData.quantity, 10);
      if (!qty || qty <= 0) {
        showError('Quantity must be at least 1.');
        return;
      }
      payload.item_description = formData.item_description.trim();
      payload.quantity = qty;
    }

    try {
      setSubmitting(true);
      const donation = await donationsApi.create(payload);
      showSuccess('Thank you! Your donation has been recorded.');
      navigate(`/donations/${donation.id}`);
    } catch (err) {
      showError(err.message || 'Failed to submit donation. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <LoadingState message="Preparing donation form..." />;
  }

  return (
    <div className="space-y-6 animate-fade-in" style={{ maxWidth: '42rem', margin: '0 auto' }}>
      <div>
        <h1 className="text-3xl font-bold text-main">Make a Donation</h1>
        <p className="text-muted" style={{ marginTop: '0.25rem' }}>
          Your generous support brings food, warmth, education, and hope to children in need.
        </p>
      </div>

      {selectedRequest && (
        <div
          className="card"
          style={{
            backgroundColor: 'var(--primary-light)',
            borderColor: 'var(--primary-hover)',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '1rem',
          }}
        >
          <FileText size={24} style={{ color: 'var(--primary)', flexShrink: 0, marginTop: '0.125rem' }} />
          <div style={{ flex: 1 }}>
            <p className="text-xs font-bold text-primary" style={{ textTransform: 'uppercase' }}>
              Fulfilling Request
            </p>
            <p className="font-bold text-main">{selectedRequest.title}</p>
            <p className="text-sm text-secondary" style={{ marginTop: '0.25rem' }}>
              Needed: {selectedRequest.quantity_needed} units of {selectedRequest.item_type}
            </p>
          </div>
          <button
            type="button"
            className="btn btn-outline btn-sm"
            onClick={() => {
              setSelectedRequest(null);
              setFormData((prev) => ({ ...prev, request_id: '' }));
            }}
          >
            Clear
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="card space-y-6">
        {/* Orphanage Selection */}
        <div className="form-group">
          <label className="form-label" htmlFor="orphanage_id">
            Select Recipient Orphanage <span className="text-danger">*</span>
          </label>
          <select
            id="orphanage_id"
            name="orphanage_id"
            value={formData.orphanage_id}
            onChange={handleChange}
            className="form-select"
            required
            disabled={Boolean(selectedRequest)}
          >
            <option value="">-- Choose an orphanage --</option>
            {orphanages.map((o) => (
              <option key={o.id} value={o.id}>
                {o.name} — {o.address} ({o.verification_status})
              </option>
            ))}
          </select>
          {orphanages.length === 0 && (
            <p className="text-xs text-muted" style={{ marginTop: '0.5rem' }}>
              No verified orphanages available yet. Browse our <Link to="/orphanages" className="text-primary">orphanages directory</Link>.
            </p>
          )}
        </div>

        {/* Donation Type Selector */}
        <div className="form-group">
          <label className="form-label">
            Donation Type <span className="text-danger">*</span>
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <button
              type="button"
              onClick={() => setFormData((prev) => ({ ...prev, donation_type: 'money' }))}
              className={`card text-center ${
                formData.donation_type === 'money'
                  ? 'border-primary ring-2'
                  : 'hover:border-slate-300'
              }`}
              style={{
                cursor: 'pointer',
                borderColor: formData.donation_type === 'money' ? 'var(--primary)' : 'var(--border)',
                backgroundColor: formData.donation_type === 'money' ? 'var(--primary-light)' : '#ffffff',
                padding: '1.25rem 1rem',
              }}
            >
              <DollarSign
                size={28}
                style={{
                  margin: '0 auto 0.5rem',
                  color: formData.donation_type === 'money' ? 'var(--primary)' : 'var(--text-muted)',
                }}
              />
              <p className="font-bold text-main">Monetary Donation</p>
              <p className="text-xs text-muted">Direct financial aid for urgent needs</p>
            </button>

            <button
              type="button"
              onClick={() => setFormData((prev) => ({ ...prev, donation_type: 'item' }))}
              className={`card text-center ${
                formData.donation_type === 'item'
                  ? 'border-primary ring-2'
                  : 'hover:border-slate-300'
              }`}
              style={{
                cursor: 'pointer',
                borderColor: formData.donation_type === 'item' ? 'var(--primary)' : 'var(--border)',
                backgroundColor: formData.donation_type === 'item' ? 'var(--primary-light)' : '#ffffff',
                padding: '1.25rem 1rem',
              }}
            >
              <Package
                size={28}
                style={{
                  margin: '0 auto 0.5rem',
                  color: formData.donation_type === 'item' ? 'var(--primary)' : 'var(--text-muted)',
                }}
              />
              <p className="font-bold text-main">Item Donation</p>
              <p className="text-xs text-muted">Clothes, books, toys, supplies</p>
            </button>
          </div>
        </div>

        {/* Dynamic Fields: Money */}
        {formData.donation_type === 'money' && (
          <div className="space-y-4 animate-fade-in">
            <div className="form-group">
              <label className="form-label" htmlFor="amount">
                Donation Amount (USD) <span className="text-danger">*</span>
              </label>
              <div style={{ position: 'relative', width: '100%' }}>
                <span
                  style={{
                    position: 'absolute',
                    left: '1rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    fontWeight: 700,
                    color: 'var(--text-muted)',
                    fontSize: '1rem',
                    pointerEvents: 'none',
                  }}
                >
                  $
                </span>
                <input
                  id="amount"
                  type="number"
                  name="amount"
                  value={formData.amount}
                  onChange={handleChange}
                  placeholder="50.00"
                  min="1"
                  step="0.01"
                  required
                  className="form-input"
                  style={{ paddingLeft: '2.5rem', width: '100%' }}
                />
              </div>
            </div>

            {/* Quick amount presets */}
            <div>
              <p className="text-xs text-muted font-medium" style={{ marginBottom: '0.5rem' }}>
                Quick Select
              </p>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {[10, 25, 50, 100, 250, 500].map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setFormData((prev) => ({ ...prev, amount: String(val) }))}
                    className="btn btn-outline btn-sm"
                    style={{
                      borderColor: formData.amount === String(val) ? 'var(--primary)' : 'var(--border)',
                      backgroundColor: formData.amount === String(val) ? 'var(--primary-light)' : 'transparent',
                    }}
                  >
                    ${val}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Dynamic Fields: Item */}
        {formData.donation_type === 'item' && (
          <div className="space-y-4 animate-fade-in">
            <div className="form-group">
              <label className="form-label" htmlFor="item_description">
                Item Description <span className="text-danger">*</span>
              </label>
              <textarea
                id="item_description"
                name="item_description"
                value={formData.item_description}
                onChange={handleChange}
                placeholder="e.g. 10 Winter jackets (sizes 6-12), 20 storybooks, boxed dry rations..."
                rows={3}
                required
                className="form-textarea"
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="quantity">
                Quantity <span className="text-danger">*</span>
              </label>
              <input
                id="quantity"
                type="number"
                name="quantity"
                value={formData.quantity}
                onChange={handleChange}
                min="1"
                required
                className="form-input"
                style={{ maxWidth: '14rem' }}
              />
            </div>
          </div>
        )}

        <div style={{ paddingTop: '1rem', borderTop: '1px solid var(--border)' }}>
          <button
            type="submit"
            disabled={submitting}
            className="btn btn-primary"
            style={{ width: '100%', padding: '0.875rem' }}
          >
            {submitting ? (
              'Processing Donation...'
            ) : (
              <>
                <Heart size={18} />
                Confirm and Donate
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
