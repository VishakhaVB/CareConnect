import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { requestsApi } from '../../api/requests';
import { StatusBadge } from '../../components/common/StatusBadge';
import { LoadingState } from '../../components/common/LoadingState';
import { EmptyState } from '../../components/common/EmptyState';
import { ErrorState } from '../../components/common/ErrorState';
import { Package, Search, Filter, ArrowRight } from 'lucide-react';

export function RequestsPage() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('open');
  const [searchTerm, setSearchTerm] = useState('');

  const loadRequests = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await requestsApi.list({ status: statusFilter || undefined });
      setRequests(data);
    } catch (err) {
      setError(err.message || 'Failed to load item requests.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, [statusFilter]);

  const filtered = requests.filter((r) => {
    const term = searchTerm.toLowerCase();
    return (
      r.title.toLowerCase().includes(term) ||
      r.item_type.toLowerCase().includes(term) ||
      (r.description && r.description.toLowerCase().includes(term))
    );
  });

  return (
    <div className="max-w-7xl" style={{ padding: '2.5rem 1.5rem' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 className="text-3xl font-extrabold text-main" style={{ marginBottom: '0.375rem' }}>
          Itemized Community Needs
        </h1>
        <p className="text-secondary text-base">
          Direct, verifiable supply requests published by verified care centers. Fulfill exact needs with items or monetary donations.
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
            placeholder="Search by title, supply type, or keywords..."
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
            <option value="">All Statuses</option>
            <option value="open">Open Needs Only</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Fulfilled</option>
          </select>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <LoadingState message="Fetching item requests..." />
      ) : error ? (
        <ErrorState message={error} onRetry={loadRequests} />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={Package}
          title="No item requests found"
          description={searchTerm ? `No requests matching "${searchTerm}". Try modifying your filter.` : 'No requests currently match the selected status.'}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((req) => (
            <div key={req.id} className="card card-hover" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                  <StatusBadge status={req.urgency} />
                  <StatusBadge status={req.status} />
                </div>

                <h3 className="text-lg font-bold text-main" style={{ marginBottom: '0.375rem' }}>
                  {req.title}
                </h3>

                <p className="text-secondary text-xs" style={{ marginBottom: '1rem', lineHeight: '1.5' }}>
                  {req.description || 'Essential supplies required for children in need.'}
                </p>

                <div
                  style={{
                    padding: '0.75rem 1rem',
                    backgroundColor: 'var(--bg-subtle)',
                    borderRadius: 'var(--radius-md)',
                    fontSize: '0.8125rem',
                    marginBottom: '1rem',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                    <span className="text-muted">Item Category:</span>
                    <span className="font-semibold text-main capitalize">{req.item_type}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span className="text-muted">Quantity Needed:</span>
                    <span className="font-bold text-primary">{req.quantity_needed} units</span>
                  </div>
                </div>
              </div>

              <div style={{ borderTop: '1px solid var(--border)', paddingTop: '0.875rem', display: 'flex', gap: '0.5rem' }}>
                <Link
                  to={`/orphanages/${req.orphanage_id}`}
                  className="btn btn-outline btn-sm"
                  style={{ flex: 1 }}
                >
                  View Orphanage
                </Link>
                {req.status === 'open' && (
                  <Link
                    to="/donate"
                    state={{ orphanageId: req.orphanage_id, requestId: req.id }}
                    className="btn btn-primary btn-sm"
                    style={{ flex: 1 }}
                  >
                    Fulfill Need
                    <ArrowRight size={14} />
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
