import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  Heart,
  Package,
  Calendar,
  UserCheck,
  Building2,
  Bell,
  Award,
  User,
  ShieldCheck,
  FileText,
  Users,
  BarChart3,
} from 'lucide-react';

export function Sidebar() {
  const { user, isDonor, isVolunteer, isAdmin, orphanage } = useAuth();

  const linkStyle = ({ isActive }) =>
    `flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
      isActive
        ? 'bg-sky-50 text-primary font-semibold'
        : 'text-secondary hover:bg-slate-50 hover:text-primary'
    }`;

  return (
    <aside
      style={{
        width: '16rem',
        backgroundColor: '#ffffff',
        borderRight: '1px solid var(--border)',
        minHeight: 'calc(100vh - 4.25rem)',
        padding: '1.25rem 1rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '1.5rem',
      }}
      className="hidden md:flex flex-shrink-0"
    >
      {/* User summary card */}
      <div
        style={{
          padding: '0.875rem 1rem',
          backgroundColor: 'var(--bg-subtle)',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border)',
        }}
      >
        <p className="text-xs text-muted font-medium">Signed in as</p>
        <p className="text-sm font-bold text-main" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {user?.name}
        </p>
        <div style={{ marginTop: '0.375rem', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
          <span className="badge badge-info" style={{ textTransform: 'capitalize' }}>
            {user?.role}
          </span>
          {orphanage && (
            <span className="badge badge-verified" title={orphanage.name}>
              Orphanage
            </span>
          )}
        </div>
      </div>

      <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
        <p className="text-xs font-bold text-muted" style={{ padding: '0 0.75rem', marginBottom: '0.375rem', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
          Overview
        </p>
        <NavLink to="/dashboard" className={linkStyle}>
          <LayoutDashboard size={18} />
          Dashboard
        </NavLink>
        <NavLink to="/profile" className={linkStyle}>
          <User size={18} />
          My Profile
        </NavLink>
        <NavLink to="/notifications" className={linkStyle}>
          <Bell size={18} />
          Notifications
        </NavLink>
        <NavLink to="/badges" className={linkStyle}>
          <Award size={18} />
          Badges
        </NavLink>

        {/* Donor section */}
        {isDonor && (
          <>
            <p className="text-xs font-bold text-muted" style={{ padding: '0 0.75rem', marginTop: '1rem', marginBottom: '0.375rem', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
              Donor
            </p>
            <NavLink to="/donate" className={linkStyle}>
              <Heart size={18} />
              Make a Donation
            </NavLink>
            <NavLink to="/donations" className={linkStyle}>
              <Package size={18} />
              My Donations
            </NavLink>
          </>
        )}

        {/* Volunteer section */}
        {isVolunteer && (
          <>
            <p className="text-xs font-bold text-muted" style={{ padding: '0 0.75rem', marginTop: '1rem', marginBottom: '0.375rem', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
              Volunteer
            </p>
            <NavLink to="/volunteer/profile" className={linkStyle}>
              <UserCheck size={18} />
              Volunteer Profile
            </NavLink>
            <NavLink to="/volunteer/participations" className={linkStyle}>
              <Calendar size={18} />
              My Participations
            </NavLink>
          </>
        )}

        {/* Orphanage management section */}
        {user?.role !== 'donor' && (
          <>
            <p className="text-xs font-bold text-muted" style={{ padding: '0 0.75rem', marginTop: '1rem', marginBottom: '0.375rem', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
              Orphanage
            </p>
            <NavLink to="/orphanage/profile" className={linkStyle}>
              <Building2 size={18} />
              {orphanage ? 'Orphanage Profile' : 'Setup Orphanage'}
            </NavLink>
            {orphanage && (
              <>
                <NavLink to="/orphanage/requests" className={linkStyle}>
                  <Package size={18} />
                  Manage Requests
                </NavLink>
                <NavLink to="/orphanage/donations" className={linkStyle}>
                  <Heart size={18} />
                  Received Donations
                </NavLink>
                <NavLink to="/orphanage/events" className={linkStyle}>
                  <Calendar size={18} />
                  Manage Events
                </NavLink>
                <NavLink to="/orphanage/stories" className={linkStyle}>
                  <FileText size={18} />
                  Impact Stories
                </NavLink>
              </>
            )}
          </>
        )}

        {/* Admin section */}
        {isAdmin && (
          <>
            <p className="text-xs font-bold text-muted" style={{ padding: '0 0.75rem', marginTop: '1rem', marginBottom: '0.375rem', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
              Administration
            </p>
            <NavLink to="/admin" className={linkStyle} end>
              <BarChart3 size={18} />
              Platform Statistics
            </NavLink>
            <NavLink to="/admin/users" className={linkStyle}>
              <Users size={18} />
              Users Directory
            </NavLink>
            <NavLink to="/admin/orphanages" className={linkStyle}>
              <ShieldCheck size={18} />
              Orphanage Verification
            </NavLink>
            <NavLink to="/admin/badges" className={linkStyle}>
              <Award size={18} />
              Manage Badges
            </NavLink>
          </>
        )}
      </nav>
    </aside>
  );
}
