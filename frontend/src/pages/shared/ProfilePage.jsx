import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { User, Mail, Calendar, ShieldCheck, Building2, UserCheck, ArrowRight } from 'lucide-react';

export function ProfilePage() {
  const { user, isVolunteer, orphanage } = useAuth();

  return (
    <div className="max-w-4xl" style={{ padding: '1rem 0' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 className="text-3xl font-bold text-main" style={{ marginBottom: '0.375rem' }}>
          My Profile
        </h1>
        <p className="text-secondary text-sm">
          Your personal account information and community roles on CareConnect.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Main Profile Info */}
        <div className="card md:col-span-2" style={{ padding: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.75rem' }}>
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
              }}
            >
              <User size={32} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-main">{user?.name}</h2>
              <p className="text-sm text-muted">{user?.email}</p>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', borderTop: '1px solid var(--border)', paddingTop: '1.5rem' }}>
            <div>
              <span className="text-xs text-muted font-semibold uppercase">Account Role</span>
              <p className="text-base font-bold text-primary capitalize" style={{ marginTop: '0.125rem' }}>
                {user?.role}
              </p>
            </div>

            <div>
              <span className="text-xs text-muted font-semibold uppercase">Member Since</span>
              <p className="text-sm text-secondary" style={{ marginTop: '0.125rem' }}>
                {user?.created_at ? new Date(user.created_at).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' }) : 'N/A'}
              </p>
            </div>

            <div>
              <span className="text-xs text-muted font-semibold uppercase">User ID</span>
              <p className="text-sm text-secondary font-mono" style={{ marginTop: '0.125rem' }}>
                #{user?.id}
              </p>
            </div>
          </div>
        </div>

        {/* Role Extension Cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {isVolunteer && (
            <div className="card" style={{ padding: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <UserCheck size={18} className="text-teal" />
                <h3 className="text-base font-bold text-main">Volunteer Profile</h3>
              </div>
              <p className="text-xs text-secondary" style={{ lineHeight: '1.5', marginBottom: '1rem' }}>
                Keep your skills, general availability, and city location up-to-date so orphanages can match tasks.
              </p>
              <Link to="/volunteer/profile" className="btn btn-outline btn-sm" style={{ width: '100%' }}>
                Edit Volunteer Profile
                <ArrowRight size={14} />
              </Link>
            </div>
          )}

          {user?.role !== 'donor' && (
            <div className="card" style={{ padding: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <Building2 size={18} className="text-primary" />
                <h3 className="text-base font-bold text-main">Orphanage Home</h3>
              </div>
              <p className="text-xs text-secondary" style={{ lineHeight: '1.5', marginBottom: '1rem' }}>
                {orphanage
                  ? `Associated with "${orphanage.name}" (${orphanage.verification_status}).`
                  : 'You are eligible to register an orphanage profile under this account.'}
              </p>
              <Link to="/orphanage/profile" className="btn btn-primary btn-sm" style={{ width: '100%' }}>
                {orphanage ? 'Manage Orphanage Profile' : 'Setup Orphanage Profile'}
                <ArrowRight size={14} />
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
