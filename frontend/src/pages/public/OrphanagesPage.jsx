import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { orphanagesApi } from '../../api/orphanages';
import { StatusBadge } from '../../components/common/StatusBadge';
import { LoadingState } from '../../components/common/LoadingState';
import { EmptyState } from '../../components/common/EmptyState';
import { ErrorState } from '../../components/common/ErrorState';
import { Building2, MapPin, Search, Filter } from 'lucide-react';

export function OrphanagesPage() {
  const [orphanages, setOrphanages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const fetchOrphanages = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await orphanagesApi.list(statusFilter || undefined);
      setOrphanages(data);
    } catch (err) {
      setError(err.message || 'Failed to load orphanages.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrphanages();
  }, [statusFilter]);

  const filtered = orphanages.filter((o) => {
    const term = searchTerm.toLowerCase();
    return o.name.toLowerCase().includes(term) || o.address.toLowerCase().includes(term);
  });

  return (
    <div className="max-w-7xl" style={{ padding: '2.5rem 1.5rem' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 className="text-3xl font-extrabold text-main" style={{ marginBottom: '0.375rem' }}>
          Verified Orphanages & Care Homes
        </h1>
        <p className="text-secondary text-base">
          Browse vetted care centers in the community. Inspect their specific item needs, reviews, and community events.
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
            placeholder="Search orphanages by name or city..."
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
            <option value="verified">Verified Only</option>
            <option value="pending">Pending</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <LoadingState message="Loading orphanages..." />
      ) : error ? (
        <ErrorState message={error} onRetry={fetchOrphanages} />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={Building2}
          title="No orphanages found"
          description={searchTerm ? `No results matching "${searchTerm}". Try a different search term.` : 'No orphanages are currently registered with this status.'}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((o) => (
            <div key={o.id} className="card card-hover" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.875rem' }}>
                  <StatusBadge status={o.verification_status} />
                  <span className="text-xs text-muted">
                    Joined {new Date(o.created_at).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}
                  </span>
                </div>

                <h3 className="text-xl font-bold text-main" style={{ marginBottom: '0.5rem' }}>
                  {o.name}
                </h3>

                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', color: 'var(--text-secondary)' }}>
                  <MapPin size={16} style={{ flexShrink: 0, marginTop: '0.2rem', color: 'var(--primary)' }} />
                  <span className="text-sm leading-relaxed">{o.address}</span>
                </div>
              </div>

              <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1rem', marginTop: '1.5rem', display: 'flex', gap: '0.5rem' }}>
                <Link to={`/orphanages/${o.id}`} className="btn btn-outline btn-sm" style={{ flex: 1 }}>
                  View Profile & Needs
                </Link>
                <Link
                  to="/donate"
                  state={{ orphanageId: o.id }}
                  className="btn btn-primary btn-sm"
                  style={{ flex: 1 }}
                >
                  Donate
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
