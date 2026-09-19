import { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { notificationsApi } from '../../api/notifications';
import {
  Heart,
  Menu,
  X,
  Bell,
  Award,
  User as UserIcon,
  LogOut,
  LayoutDashboard,
} from 'lucide-react';

export function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      notificationsApi.list().then((list) => {
        if (Array.isArray(list)) {
          setUnreadCount(list.filter((n) => !n.is_read).length);
        }
      }).catch(() => {});
    } else {
      setUnreadCount(0);
    }
  }, [isAuthenticated]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navLinkClass = ({ isActive }) =>
    `text-sm font-medium ${isActive ? 'text-primary font-semibold' : 'text-secondary'} hover:text-primary transition-colors`;

  return (
    <header
      style={{
        backgroundColor: '#ffffff',
        borderBottom: '1px solid var(--border)',
        position: 'sticky',
        top: 0,
        zIndex: 50,
      }}
    >
      <div className="max-w-7xl" style={{ height: '4.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        {/* Logo */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
          <div
            style={{
              width: '2.375rem',
              height: '2.375rem',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--primary)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 4px rgba(2, 132, 199, 0.25)',
            }}
          >
            <Heart size={20} fill="#ffffff" />
          </div>
          <div>
            <span style={{ fontSize: '1.25rem', fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--text-main)' }}>
              Care<span style={{ color: 'var(--primary)' }}>Connect</span>
            </span>
          </div>
        </Link>

        {/* Desktop Public Nav */}
        <nav style={{ display: 'none', gap: '1.75rem', alignItems: 'center' }} className="md:flex">
          <NavLink to="/orphanages" className={navLinkClass}>
            Orphanages
          </NavLink>
          <NavLink to="/requests" className={navLinkClass}>
            Item Requests
          </NavLink>
          <NavLink to="/events" className={navLinkClass}>
            Events
          </NavLink>
          <NavLink to="/impact-stories" className={navLinkClass}>
            Impact Stories
          </NavLink>
        </nav>

        {/* Desktop User Section */}
        <div style={{ display: 'none', alignItems: 'center', gap: '1rem' }} className="md:flex">
          {isAuthenticated ? (
            <>
              <Link
                to="/notifications"
                className="btn-ghost"
                style={{
                  position: 'relative',
                  padding: '0.5rem',
                  borderRadius: 'var(--radius-full)',
                  color: 'var(--text-secondary)',
                }}
                title="Notifications"
              >
                <Bell size={19} />
                {unreadCount > 0 && (
                  <span
                    style={{
                      position: 'absolute',
                      top: '0.25rem',
                      right: '0.25rem',
                      width: '0.5rem',
                      height: '0.5rem',
                      backgroundColor: 'var(--danger)',
                      borderRadius: '50%',
                    }}
                  />
                )}
              </Link>

              <Link
                to="/badges"
                className="btn-ghost"
                style={{ padding: '0.5rem', borderRadius: 'var(--radius-full)', color: 'var(--text-secondary)' }}
                title="Badges"
              >
                <Award size={19} />
              </Link>

              <Link to="/dashboard" className="btn btn-primary btn-sm">
                <LayoutDashboard size={15} />
                Dashboard
              </Link>

              <Link to="/profile" className="btn btn-outline btn-sm" title={user?.name}>
                <UserIcon size={15} />
                Profile
              </Link>

              <button onClick={handleLogout} className="btn btn-ghost btn-sm" title="Log Out">
                <LogOut size={16} />
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-outline btn-sm">
                Log In
              </Link>
              <Link to="/register" className="btn btn-primary btn-sm">
                Sign Up
              </Link>
            </>
          )}
        </div>

        {/* Mobile menu toggle button */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="btn-ghost md:hidden"
          style={{ padding: '0.5rem', display: 'flex', alignItems: 'center' }}
          aria-label="Toggle navigation menu"
        >
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div
          className="md:hidden"
          style={{
            borderTop: '1px solid var(--border)',
            backgroundColor: '#ffffff',
            padding: '1.25rem 1.5rem',
          }}
        >
          <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
            <NavLink to="/orphanages" className={navLinkClass} onClick={() => setMobileOpen(false)}>
              Orphanages
            </NavLink>
            <NavLink to="/requests" className={navLinkClass} onClick={() => setMobileOpen(false)}>
              Item Requests
            </NavLink>
            <NavLink to="/events" className={navLinkClass} onClick={() => setMobileOpen(false)}>
              Events
            </NavLink>
            <NavLink to="/impact-stories" className={navLinkClass} onClick={() => setMobileOpen(false)}>
              Impact Stories
            </NavLink>

            <div style={{ height: '1px', backgroundColor: 'var(--border)', margin: '0.5rem 0' }} />

            {isAuthenticated ? (
              <>
                <Link
                  to="/dashboard"
                  className="btn btn-primary btn-sm"
                  style={{ width: '100%' }}
                  onClick={() => setMobileOpen(false)}
                >
                  <LayoutDashboard size={16} />
                  Dashboard
                </Link>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <Link
                    to="/profile"
                    className="btn btn-outline btn-sm"
                    style={{ flex: 1 }}
                    onClick={() => setMobileOpen(false)}
                  >
                    Profile
                  </Link>
                  <Link
                    to="/notifications"
                    className="btn btn-outline btn-sm"
                    style={{ flex: 1 }}
                    onClick={() => setMobileOpen(false)}
                  >
                    Notifications {unreadCount > 0 ? `(${unreadCount})` : ''}
                  </Link>
                </div>
                <button
                  onClick={() => {
                    handleLogout();
                    setMobileOpen(false);
                  }}
                  className="btn btn-ghost btn-sm"
                  style={{ width: '100%', color: 'var(--danger)' }}
                >
                  <LogOut size={16} />
                  Log Out
                </button>
              </>
            ) : (
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <Link
                  to="/login"
                  className="btn btn-outline btn-sm"
                  style={{ flex: 1 }}
                  onClick={() => setMobileOpen(false)}
                >
                  Log In
                </Link>
                <Link
                  to="/register"
                  className="btn btn-primary btn-sm"
                  style={{ flex: 1 }}
                  onClick={() => setMobileOpen(false)}
                >
                  Sign Up
                </Link>
              </div>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
