import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminApi } from '../../api/admin';
import { useToast } from '../../context/ToastContext';
import { LoadingState } from '../../components/common/LoadingState';
import {
  Users,
  Building2,
  UserCheck,
  Heart,
  Package,
  Calendar,
  ShieldCheck,
  Award,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';

export function AdminDashboardPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const { showError } = useToast();

  useEffect(() => {
    async function loadStats() {
      try {
        setLoading(true);
        const data = await adminApi.getStatistics();
        setStats(data);
      } catch (err) {
        showError(err.message || 'Failed to load platform statistics.');
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, []);

  if (loading) {
    return <LoadingState message="Loading administrative dashboard metrics..." />;
  }

  const statCards = [
    {
      title: 'Total Users',
      value: stats?.users ?? 0,
      icon: Users,
      color: 'var(--primary)',
      bg: 'var(--primary-light)',
      link: '/admin/users',
    },
    {
      title: 'Registered Care Homes',
      value: stats?.orphanages ?? 0,
      icon: Building2,
      color: '#8b5cf6',
      bg: '#f5f3ff',
      link: '/admin/orphanages',
    },
    {
      title: 'Volunteers',
      value: stats?.volunteers ?? 0,
      icon: UserCheck,
      color: 'var(--secondary)',
      bg: 'var(--accent-light)',
      link: '/admin/users',
    },
    {
      title: 'Contributions',
      value: stats?.donations ?? 0,
      icon: Heart,
      color: 'var(--danger)',
      bg: 'var(--danger-bg)',
      link: '/donations',
    },
    {
      title: 'Item Needs Published',
      value: stats?.requests ?? 0,
      icon: Package,
      color: 'var(--warning)',
      bg: 'var(--warning-bg)',
      link: '/requests',
    },
    {
      title: 'Community Events',
      value: stats?.events ?? 0,
      icon: Calendar,
      color: '#3b82f6',
      bg: '#eff6ff',
      link: '/events',
    },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary)', fontWeight: 700, fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          <ShieldCheck size={18} />
          Administration Command Center
        </div>
        <h1 className="text-3xl font-bold text-main" style={{ marginTop: '0.25rem' }}>
          Platform Analytics & Controls
        </h1>
        <p className="text-muted" style={{ marginTop: '0.25rem' }}>
          Real-time oversight over all care homes, donors, volunteer activities, and platform safety.
        </p>
      </div>

      {/* Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(14rem, 1fr))', gap: '1.25rem' }}>
        {statCards.map((card, idx) => {
          const IconComponent = card.icon;
          return (
            <Link
              key={idx}
              to={card.link}
              className="card hover:shadow-md transition-shadow"
              style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', padding: '1.25rem 1.5rem' }}
            >
              <div
                style={{
                  width: '3.25rem',
                  height: '3.25rem',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: card.bg,
                  color: card.color,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <IconComponent size={24} />
              </div>
              <div>
                <p className="text-xs text-muted font-bold uppercase tracking-wider">
                  {card.title}
                </p>
                <p className="text-3xl font-bold text-main" style={{ marginTop: '0.125rem' }}>
                  {card.value}
                </p>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Quick Administrative Management Cards */}
      <div>
        <h2 className="text-xl font-bold text-main" style={{ marginBottom: '1rem' }}>
          Management Workspaces
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(20rem, 1fr))', gap: '1.5rem' }}>
          {/* Orphanage Verification Card */}
          <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                <div
                  style={{
                    padding: '0.5rem',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: 'var(--warning-bg)',
                    color: 'var(--warning)',
                  }}
                >
                  <ShieldCheck size={20} />
                </div>
                <h3 className="font-bold text-main text-lg">Orphanage Verification</h3>
              </div>
              <p className="text-secondary text-sm">
                Review submitted care homes, inspect legal addresses, and approve or reject verification requests to maintain community trust.
              </p>
            </div>
            <div style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid var(--border)' }}>
              <Link to="/admin/orphanages" className="btn btn-primary btn-sm" style={{ width: '100%' }}>
                Review Verification Queue
                <ArrowRight size={14} />
              </Link>
            </div>
          </div>

          {/* User Directory Card */}
          <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                <div
                  style={{
                    padding: '0.5rem',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: 'var(--primary-light)',
                    color: 'var(--primary)',
                  }}
                >
                  <Users size={20} />
                </div>
                <h3 className="font-bold text-main text-lg">User Directory</h3>
              </div>
              <p className="text-secondary text-sm">
                Browse registered accounts, filter by role (donor, volunteer, both, admin), and inspect registration dates.
              </p>
            </div>
            <div style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid var(--border)' }}>
              <Link to="/admin/users" className="btn btn-primary btn-sm" style={{ width: '100%' }}>
                Manage Users
                <ArrowRight size={14} />
              </Link>
            </div>
          </div>

          {/* Badges and Recognition Card */}
          <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                <div
                  style={{
                    padding: '0.5rem',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: 'var(--accent-light)',
                    color: 'var(--secondary)',
                  }}
                >
                  <Award size={20} />
                </div>
                <h3 className="font-bold text-main text-lg">Badges & Recognition</h3>
              </div>
              <p className="text-secondary text-sm">
                Configure community milestone badges and award them to top donors and dedicated volunteers for their contributions.
              </p>
            </div>
            <div style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid var(--border)' }}>
              <Link to="/admin/badges" className="btn btn-primary btn-sm" style={{ width: '100%' }}>
                Manage Badges
                <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
