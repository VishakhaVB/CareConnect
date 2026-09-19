import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminApi } from '../../api/admin';
import { useToast } from '../../context/ToastContext';
import { LoadingState } from '../../components/common/LoadingState';
import { EmptyState } from '../../components/common/EmptyState';
import { StatusBadge } from '../../components/common/StatusBadge';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import {
  Building2,
  CheckCircle2,
  XCircle,
  Clock,
  Search,
  Filter,
  ExternalLink,
  MapPin,
  ShieldCheck,
} from 'lucide-react';

export function AdminOrphanagesPage() {
  const [orphanages, setOrphanages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  // Confirmation state for reject
  const [rejectingId, setRejectingId] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const { showSuccess, showError } = useToast();

  const loadOrphanages = async () => {
    try {
      setLoading(true);
      const data = await adminApi.getOrphanages();
      setOrphanages(data || []);
    } catch (err) {
      showError(err.message || 'Failed to load orphanages list.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrphanages();
  }, []);

  const handleVerify = async (id) => {
    try {
      setActionLoading(true);
      await adminApi.verifyOrphanage(id);
      showSuccess('Orphanage verified successfully! Notification sent to owner.');
      await loadOrphanages();
    } catch (err) {
      showError(err.message || 'Failed to verify orphanage.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!rejectingId) return;
    try {
      setActionLoading(true);
      await adminApi.rejectOrphanage(rejectingId);
      showSuccess('Orphanage verification rejected.');
      setRejectingId(null);
      await loadOrphanages();
    } catch (err) {
      showError(err.message || 'Failed to reject orphanage.');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return <LoadingState message="Loading orphanage verification queue..." />;
  }

  const pendingCount = orphanages.filter((o) => o.verification_status === 'pending').length;
  const verifiedCount = orphanages.filter((o) => o.verification_status === 'verified').length;
  const rejectedCount = orphanages.filter((o) => o.verification_status === 'rejected').length;

  const filteredOrphanages = orphanages.filter((o) => {
    const matchesStatus = filterStatus === 'all' || o.verification_status === filterStatus;
    const matchesSearch =
      o.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
      String(o.id).includes(searchTerm);
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 className="text-3xl font-bold text-main">Orphanage Verification</h1>
          <p className="text-muted" style={{ marginTop: '0.25rem' }}>
            Review legal care home registrations, vet physical addresses, and grant platform verification.
          </p>
        </div>
      </div>

      {/* Metric Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(14rem, 1fr))', gap: '1rem' }}>
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div
            style={{
              padding: '0.75rem',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--warning-bg)',
              color: 'var(--warning)',
            }}
          >
            <Clock size={24} />
          </div>
          <div>
            <p className="text-xs text-muted font-bold uppercase tracking-wider">
              Pending Review
            </p>
            <p className="text-2xl font-bold text-main">{pendingCount}</p>
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
            <CheckCircle2 size={24} />
          </div>
          <div>
            <p className="text-xs text-muted font-bold uppercase tracking-wider">
              Verified Care Homes
            </p>
            <p className="text-2xl font-bold text-main">{verifiedCount}</p>
          </div>
        </div>

        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div
            style={{
              padding: '0.75rem',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--danger-bg)',
              color: 'var(--danger)',
            }}
          >
            <XCircle size={24} />
          </div>
          <div>
            <p className="text-xs text-muted font-bold uppercase tracking-wider">
              Rejected
            </p>
            <p className="text-2xl font-bold text-main">{rejectedCount}</p>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
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
              placeholder="Search by care home name, address..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input"
              style={{ paddingLeft: '2.5rem' }}
            />
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <Filter size={16} className="text-muted" />
            <button
              type="button"
              onClick={() => setFilterStatus('all')}
              className={`btn btn-sm ${filterStatus === 'all' ? 'btn-primary' : 'btn-outline'}`}
            >
              All ({orphanages.length})
            </button>
            <button
              type="button"
              onClick={() => setFilterStatus('pending')}
              className={`btn btn-sm ${filterStatus === 'pending' ? 'btn-primary' : 'btn-outline'}`}
            >
              Pending ({pendingCount})
            </button>
            <button
              type="button"
              onClick={() => setFilterStatus('verified')}
              className={`btn btn-sm ${filterStatus === 'verified' ? 'btn-primary' : 'btn-outline'}`}
            >
              Verified
            </button>
            <button
              type="button"
              onClick={() => setFilterStatus('rejected')}
              className={`btn btn-sm ${filterStatus === 'rejected' ? 'btn-primary' : 'btn-outline'}`}
            >
              Rejected
            </button>
          </div>
        </div>
      </div>

      {/* Orphanages Table */}
      {filteredOrphanages.length === 0 ? (
        <EmptyState
          icon={Building2}
          title="No orphanages match your filter"
          description="Try selecting a different status or adjusting your search term."
        />
      ) : (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Orphanage Name</th>
                  <th>Physical Address</th>
                  <th>Owner User ID</th>
                  <th>Status</th>
                  <th>Registered</th>
                  <th style={{ textAlign: 'right' }}>Admin Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrphanages.map((orph) => (
                  <tr key={orph.id}>
                    <td className="font-mono text-xs text-muted">#{orph.id}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Building2 size={18} className="text-primary flex-shrink-0" />
                        <div>
                          <Link
                            to={`/orphanages/${orph.id}`}
                            className="font-bold text-main hover:text-primary"
                          >
                            {orph.name}
                          </Link>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', maxWidth: '18rem' }}>
                        <MapPin size={14} className="text-muted flex-shrink-0" />
                        <span className="text-secondary text-sm" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {orph.address}
                        </span>
                      </div>
                    </td>
                    <td className="font-mono text-xs text-muted">User #{orph.user_id}</td>
                    <td>
                      <StatusBadge status={orph.verification_status} />
                    </td>
                    <td className="text-secondary text-sm">
                      {new Date(orph.created_at).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', alignItems: 'center' }}>
                        {orph.verification_status !== 'verified' && (
                          <button
                            type="button"
                            onClick={() => handleVerify(orph.id)}
                            disabled={actionLoading}
                            className="btn btn-sm"
                            style={{
                              backgroundColor: 'var(--success-bg)',
                              color: 'var(--success)',
                              border: '1px solid var(--success)',
                            }}
                            title="Verify Orphanage"
                          >
                            <CheckCircle2 size={14} />
                            Approve
                          </button>
                        )}

                        {orph.verification_status !== 'rejected' && (
                          <button
                            type="button"
                            onClick={() => setRejectingId(orph.id)}
                            disabled={actionLoading}
                            className="btn btn-sm"
                            style={{
                              backgroundColor: 'var(--danger-bg)',
                              color: 'var(--danger)',
                              border: '1px solid var(--danger-border)',
                            }}
                            title="Reject Verification"
                          >
                            <XCircle size={14} />
                            Reject
                          </button>
                        )}

                        <Link
                          to={`/orphanages/${orph.id}`}
                          className="btn btn-outline btn-sm"
                          title="View Public Profile"
                        >
                          <ExternalLink size={14} />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Reject Confirmation */}
      <ConfirmDialog
        isOpen={Boolean(rejectingId)}
        title="Reject Orphanage Verification"
        message="Are you sure you want to reject verification for this orphanage? The owner will receive a notification of this decision."
        confirmText="Yes, Reject Orphanage"
        cancelText="Cancel"
        confirmVariant="danger"
        loading={actionLoading}
        onConfirm={handleReject}
        onClose={() => setRejectingId(null)}
      />
    </div>
  );
}
