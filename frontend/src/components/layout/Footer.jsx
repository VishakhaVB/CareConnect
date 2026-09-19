import { Link } from 'react-router-dom';
import { Heart, ShieldCheck, HelpCircle } from 'lucide-react';

export function Footer() {
  return (
    <footer
      style={{
        backgroundColor: '#ffffff',
        borderTop: '1px solid var(--border)',
        padding: '3rem 0 2rem',
        marginTop: 'auto',
      }}
    >
      <div className="max-w-7xl">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8" style={{ marginBottom: '2.5rem' }}>
          {/* Brand */}
          <div className="md:col-span-2">
            <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.625rem', marginBottom: '1rem' }}>
              <div
                style={{
                  width: '2rem',
                  height: '2rem',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--primary)',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Heart size={16} fill="#ffffff" />
              </div>
              <span style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)' }}>
                Care<span style={{ color: 'var(--primary)' }}>Connect</span>
              </span>
            </Link>
            <p className="text-secondary text-sm" style={{ maxWidth: '26rem', lineHeight: '1.6' }}>
              A transparent community donation platform connecting donors, orphanages, and volunteers.
              Fostering direct impact through itemized needs, verified homes, and active volunteer engagement.
            </p>
          </div>

          {/* Quick links */}
          <div>
            <h4 className="text-sm font-bold text-main" style={{ marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Platform
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
              <li>
                <Link to="/orphanages" className="text-secondary text-sm hover:text-primary transition-colors">
                  Verified Orphanages
                </Link>
              </li>
              <li>
                <Link to="/requests" className="text-secondary text-sm hover:text-primary transition-colors">
                  Itemized Needs
                </Link>
              </li>
              <li>
                <Link to="/events" className="text-secondary text-sm hover:text-primary transition-colors">
                  Volunteer Events
                </Link>
              </li>
              <li>
                <Link to="/impact-stories" className="text-secondary text-sm hover:text-primary transition-colors">
                  Impact Stories
                </Link>
              </li>
            </ul>
          </div>

          {/* Transparency & Security */}
          <div>
            <h4 className="text-sm font-bold text-main" style={{ marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Transparency
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)' }}>
                <ShieldCheck size={16} className="text-teal" />
                <span className="text-xs font-medium">Administrator-Verified Profiles</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)' }}>
                <Heart size={16} className="text-primary" />
                <span className="text-xs font-medium">Item & Money Donation Receipts</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)' }}>
                <HelpCircle size={16} className="text-muted" />
                <span className="text-xs font-medium">Direct Community Support</span>
              </div>
            </div>
          </div>
        </div>

        <div
          style={{
            borderTop: '1px solid var(--border)',
            paddingTop: '1.5rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
          className="md:flex-row text-xs text-muted"
        >
          <p>© {new Date().getFullYear()} CareConnect. All rights reserved.</p>
          <p>CareConnect Community Donation Platform</p>
        </div>
      </div>
    </footer>
  );
}
