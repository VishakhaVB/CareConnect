import { Link, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ShieldAlert, Home, PlusCircle } from 'lucide-react';
import { LoadingState } from './LoadingState';

export function RoleGuard({
  allowedRoles,
  requireOrphanage = false,
  children,
}) {
  const { user, orphanage, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <LoadingState message="Verifying permissions..." />
      </div>
    );
  }

  // Check role requirement
  const hasRole = !allowedRoles || (user && allowedRoles.includes(user.role));

  // Check orphanage requirement
  const hasOrph = !requireOrphanage || Boolean(orphanage);

  if (!hasRole) {
    return (
      <div className="max-w-3xl" style={{ margin: '4rem auto' }}>
        <div className="card text-center" style={{ padding: '3.5rem 2rem' }}>
          <div
            style={{
              width: '4rem',
              height: '4rem',
              borderRadius: 'var(--radius-full)',
              backgroundColor: 'var(--danger-bg)',
              color: 'var(--danger)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.5rem',
            }}
          >
            <ShieldAlert size={32} />
          </div>
          <h2 className="text-2xl font-bold text-main" style={{ marginBottom: '0.75rem' }}>
            Access Denied
          </h2>
          <p className="text-muted" style={{ maxWidth: '28rem', margin: '0 auto 2rem' }}>
            You do not have the required permissions ({allowedRoles?.join(', ')}) to access this page.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <Link to="/dashboard" className="btn btn-primary">
              <Home size={16} />
              Return to Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // If role is allowed (e.g. both/volunteer/admin) but an orphanage profile is required and missing:
  if (requireOrphanage && !hasOrph) {
    return (
      <div className="max-w-3xl" style={{ margin: '4rem auto' }}>
        <div className="card text-center" style={{ padding: '3.5rem 2rem' }}>
          <div
            style={{
              width: '4rem',
              height: '4rem',
              borderRadius: 'var(--radius-full)',
              backgroundColor: 'var(--primary-light)',
              color: 'var(--primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.5rem',
            }}
          >
            <PlusCircle size={32} />
          </div>
          <h2 className="text-2xl font-bold text-main" style={{ marginBottom: '0.75rem' }}>
            Orphanage Profile Required
          </h2>
          <p className="text-muted" style={{ maxWidth: '28rem', margin: '0 auto 2rem' }}>
            You must register an orphanage profile associated with your account before you can manage requests, events, or donations.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <Link to="/orphanage/profile" className="btn btn-primary">
              <PlusCircle size={16} />
              Setup Orphanage Profile
            </Link>
            <Link to="/dashboard" className="btn btn-outline">
              <Home size={16} />
              Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return children ? children : <Outlet />;
}
