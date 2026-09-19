import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { donationsApi } from '../../api/donations';
import { orphanagesApi } from '../../api/orphanages';
import { useToast } from '../../context/ToastContext';
import { LoadingState } from '../../components/common/LoadingState';
import { EmptyState } from '../../components/common/EmptyState';
import { StatusBadge } from '../../components/common/StatusBadge';
import {
  Heart,
  Package,
  DollarSign,
  Calendar,
  ExternalLink,
  Search,
  Filter,
  Receipt,
} from 'lucide-react';

export function MyDonationsPage() {
  const [donations, setDonations] = useState([]);
  const [orphanagesMap, setOrphanagesMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const { showError } = useToast();

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [myDonations, orphList] = await Promise.all([
          donationsApi.getMyDonations(),
          orphanagesApi.list(),
        ]);

        setDonations(myDonations || []);

        const map = {};
        if (orphList && Array.isArray(orphList)) {
          orphList.forEach((o) => {
            map[o.id] = o;
          });
        }
        setOrphanagesMap(map);
      } catch (err) {
        showError('Failed to load donations history.');
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const totalMoney = donations
    .filter((d) => d.donation_type === 'money' && d.amount)
    .reduce((sum, d) => sum + parseFloat(d.amount), 0);

  const totalItems = donations
    .filter((d) => d.donation_type === 'item')
    .reduce((sum, d) => sum + (d.quantity || 1), 0);

  const filteredDonations = donations.filter((d) => {
    const matchesType = filterType === 'all' || d.donation_type === filterType;
    const orphName = orphanagesMap[d.orphanage_id]?.name || '';
    const desc = d.item_description || '';
    const matchesSearch =
      orphName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      desc.toLowerCase().includes(searchTerm.toLowerCase()) ||
      String(d.id).includes(searchTerm);
    return matchesType && matchesSearch;
  });

  if (loading) {
    return <LoadingState message="Loading your donations history..." />;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 className="text-3xl font-bold text-main">My Donations</h1>
          <p className="text-muted" style={{ marginTop: '0.25rem' }}>
            Track your history of generosity and download receipts for your records.
          </p>
        </div>
        <Link to="/donate" className="btn btn-primary">
          <Heart size={16} />
          New Donation
        </Link>
      </div>

      {/* Summary Metrics */}
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
              Total Donations
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
              Funds Contributed
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
              Items Donated
            </p>
            <p className="text-2xl font-bold text-main">{totalItems} units</p>
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
              placeholder="Search by orphanage or item..."
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

      {/* Donations List / Table */}
      {filteredDonations.length === 0 ? (
        <EmptyState
          icon={Heart}
          title={donations.length === 0 ? "You haven't made any donations yet" : "No donations match your search"}
          description={
            donations.length === 0
              ? 'Start supporting verified community orphanages today by making your first contribution.'
              : 'Try adjusting your search terms or filter selection.'
          }
          action={
            donations.length === 0 && (
              <Link to="/donate" className="btn btn-primary">
                <Heart size={16} />
                Make Your First Donation
              </Link>
            )
          }
        />
      ) : (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Date</th>
                  <th>Recipient Orphanage</th>
                  <th>Type</th>
                  <th>Contribution</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredDonations.map((d) => {
                  const orph = orphanagesMap[d.orphanage_id];
                  const dateStr = new Date(d.created_at).toLocaleDateString(undefined, {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  });

                  return (
                    <tr key={d.id}>
                      <td className="font-mono text-xs text-muted">#{d.id}</td>
                      <td className="text-secondary text-sm">{dateStr}</td>
                      <td>
                        {orph ? (
                          <Link
                            to={`/orphanages/${orph.id}`}
                            className="font-semibold text-main hover:text-primary"
                          >
                            {orph.name}
                          </Link>
                        ) : (
                          <span className="text-muted">Orphanage #{d.orphanage_id}</span>
                        )}
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
                        <Link
                          to={`/donations/${d.id}`}
                          className="btn btn-outline btn-sm"
                        >
                          <Receipt size={14} />
                          View & Receipt
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
