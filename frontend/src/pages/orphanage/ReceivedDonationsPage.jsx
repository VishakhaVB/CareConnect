import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { donationsApi } from '../../api/donations';
import { useToast } from '../../context/ToastContext';
import { LoadingState } from '../../components/common/LoadingState';
import { EmptyState } from '../../components/common/EmptyState';
import { StatusBadge } from '../../components/common/StatusBadge';
import {
  Heart,
  DollarSign,
  Package,
  Search,
  Filter,
  Receipt,
  Calendar,
  ExternalLink,
} from 'lucide-react';

export function ReceivedDonationsPage() {
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const { showError } = useToast();

  useEffect(() => {
    async function loadDonations() {
      try {
        setLoading(true);
        const data = await donationsApi.getReceivedDonations();
        setDonations(data || []);
      } catch (err) {
        showError(err.message || 'Failed to load received donations.');
      } finally {
        setLoading(false);
      }
    }
    loadDonations();
  }, []);

  const totalMoney = donations
    .filter((d) => d.donation_type === 'money' && d.amount)
    .reduce((sum, d) => sum + parseFloat(d.amount), 0);

  const totalItems = donations
    .filter((d) => d.donation_type === 'item')
    .reduce((sum, d) => sum + (d.quantity || 1), 0);

  const filtered = donations.filter((d) => {
    const matchesType = filterType === 'all' || d.donation_type === filterType;
    const desc = d.item_description || '';
    const matchesSearch =
      desc.toLowerCase().includes(searchTerm.toLowerCase()) ||
      String(d.id).includes(searchTerm) ||
      String(d.donor_id).includes(searchTerm);
    return matchesType && matchesSearch;
  });

  if (loading) {
    return <LoadingState message="Loading received donations..." />;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold text-main">Received Donations</h1>
        <p className="text-muted" style={{ marginTop: '0.25rem' }}>
          Overview of all financial grants and physical item contributions sent to your care home.
        </p>
      </div>

      {/* Metrics */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(14rem, 1fr))', gap: '1rem' }}>
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div
            style={{
              padding: '0.75rem',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--primary-light)',
              color: 'var(--primary)',
            }}
          >
            <Heart size={24} />
          </div>
          <div>
            <p className="text-xs text-muted font-bold" style={{ textTransform: 'uppercase' }}>
              Total Contributions
            </p>
            <p className="text-2xl font-bold text-main">{donations.length}</p>
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
            <DollarSign size={24} />
          </div>
          <div>
            <p className="text-xs text-muted font-bold" style={{ textTransform: 'uppercase' }}>
              Funds Received
            </p>
            <p className="text-2xl font-bold text-main">${totalMoney.toFixed(2)}</p>
          </div>
        </div>

        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div
            style={{
              padding: '0.75rem',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--accent-light)',
              color: 'var(--secondary)',
            }}
          >
            <Package size={24} />
          </div>
          <div>
            <p className="text-xs text-muted font-bold" style={{ textTransform: 'uppercase' }}>
              Items Received
            </p>
            <p className="text-2xl font-bold text-main">{totalItems} units</p>
          </div>
        </div>
      </div>

      {/* Filter and Search */}
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
              placeholder="Search by description or ID..."
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
              onClick={() => setFilterType('all')}
              className={`btn btn-sm ${filterType === 'all' ? 'btn-primary' : 'btn-outline'}`}
            >
              All ({donations.length})
            </button>
            <button
              type="button"
              onClick={() => setFilterType('money')}
              className={`btn btn-sm ${filterType === 'money' ? 'btn-primary' : 'btn-outline'}`}
            >
              Money
            </button>
            <button
              type="button"
              onClick={() => setFilterType('item')}
              className={`btn btn-sm ${filterType === 'item' ? 'btn-primary' : 'btn-outline'}`}
            >
              Items
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={Heart}
          title={donations.length === 0 ? 'No donations received yet' : 'No matching donations found'}
          description={
            donations.length === 0
              ? 'Make sure your orphanage profile is verified and you have published active item needs.'
              : 'Try clearing your search or switching filter categories.'
          }
        />
      ) : (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Ref ID</th>
                  <th>Date</th>
                  <th>Type</th>
                  <th>Donation Details</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((d) => (
                  <tr key={d.id}>
                    <td className="font-mono text-xs text-muted">#{d.id}</td>
                    <td className="text-secondary text-sm">
                      {new Date(d.created_at).toLocaleDateString(undefined, {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </td>
                    <td>
                      <span
                        className={`badge ${
                          d.donation_type === 'money' ? 'badge-verified' : 'badge-info'
                        }`}
                        style={{ textTransform: 'capitalize' }}
                      >
                        {d.donation_type}
                      </span>
                    </td>
                    <td>
                      {d.donation_type === 'money' ? (
                        <span className="font-bold text-main">${parseFloat(d.amount).toFixed(2)}</span>
                      ) : (
                        <div>
                          <span className="font-bold text-main">{d.quantity}x </span>
                          <span className="text-secondary text-sm">{d.item_description}</span>
                        </div>
                      )}
                    </td>
                    <td>
                      <StatusBadge status={d.status} />
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <Link to={`/donations/${d.id}`} className="btn btn-outline btn-sm">
                        <Receipt size={14} />
                        View Record
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
