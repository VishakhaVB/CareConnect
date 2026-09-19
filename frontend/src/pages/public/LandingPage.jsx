import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { orphanagesApi } from '../../api/orphanages';
import { requestsApi } from '../../api/requests';
import { eventsApi } from '../../api/events';
import { impactStoriesApi } from '../../api/impactStories';
import { StatusBadge } from '../../components/common/StatusBadge';
import {
  Heart,
  ShieldCheck,
  Package,
  Calendar,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Users,
  MapPin,
} from 'lucide-react';
import { Footer } from '../../components/layout/Footer';

export function LandingPage() {
  const { isAuthenticated, isDonor, isVolunteer } = useAuth();
  const [orphanages, setOrphanages] = useState([]);
  const [requests, setRequests] = useState([]);
  const [events, setEvents] = useState([]);
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [orphData, reqData, evData, storyData] = await Promise.all([
          orphanagesApi.list('verified').catch(() => []),
          requestsApi.list({ status: 'open' }).catch(() => []),
          eventsApi.list({ status: 'upcoming' }).catch(() => []),
          impactStoriesApi.list().catch(() => []),
        ]);
        setOrphanages(orphData.slice(0, 3));
        setRequests(reqData.slice(0, 4));
        setEvents(evData.slice(0, 3));
        setStories(storyData.slice(0, 3));
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* Hero Section */}
      <section
        style={{
          background: 'linear-gradient(180deg, #ffffff 0%, #f0f9ff 100%)',
          borderBottom: '1px solid var(--border)',
          padding: '4.5rem 0 4rem',
        }}
      >
        <div className="max-w-7xl text-center">
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.375rem 0.875rem',
              borderRadius: 'var(--radius-full)',
              backgroundColor: 'var(--primary-light)',
              color: 'var(--primary)',
              fontSize: '0.8125rem',
              fontWeight: 600,
              marginBottom: '1.25rem',
            }}
          >
            <ShieldCheck size={16} />
            Administrator-Verified Community Platform
          </div>

          <h1
            className="text-4xl md:text-5xl font-extrabold text-main"
            style={{ maxWidth: '48rem', margin: '0 auto 1.25rem', lineHeight: '1.15' }}
          >
            A Transparent Platform Connecting{' '}
            <span style={{ color: 'var(--primary)' }}>Donors</span>,{' '}
            <span style={{ color: 'var(--secondary)' }}>Orphanages</span> &{' '}
            <span>Volunteers</span>
          </h1>

          <p
            className="text-lg text-secondary"
            style={{ maxWidth: '38rem', margin: '0 auto 2.25rem', lineHeight: '1.6' }}
          >
            Empowering child care homes through direct itemized needs, money donations with verified receipts, and active community volunteer participation.
          </p>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/requests" className="btn btn-primary btn-lg">
              <Package size={18} />
              Browse Needed Items
            </Link>
            <Link to="/events" className="btn btn-outline btn-lg">
              <Calendar size={18} />
              Volunteer for Events
            </Link>
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section style={{ padding: '4.5rem 0', borderBottom: '1px solid var(--border)', backgroundColor: '#ffffff' }}>
        <div className="max-w-7xl">
          <div className="text-center" style={{ marginBottom: '3.5rem' }}>
            <h2 className="text-3xl font-extrabold text-main" style={{ marginBottom: '0.5rem' }}>
              How CareConnect Works
            </h2>
            <p className="text-muted text-base" style={{ maxWidth: '32rem', margin: '0 auto' }}>
              Built for end-to-end transparency, authenticity, and direct community impact.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div
                style={{
                  width: '3rem',
                  height: '3rem',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--primary-light)',
                  color: 'var(--primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <ShieldCheck size={24} />
              </div>
              <h3 className="text-xl font-bold text-main">1. Verified Homes</h3>
              <p className="text-secondary text-sm" style={{ lineHeight: '1.6' }}>
                Every orphanage profile is manually audited and approved by administrators before receiving community support.
              </p>
            </div>

            <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div
                style={{
                  width: '3rem',
                  height: '3rem',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--secondary-light)',
                  color: 'var(--secondary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Package size={24} />
              </div>
              <h3 className="text-xl font-bold text-main">2. Itemized Requests</h3>
              <p className="text-secondary text-sm" style={{ lineHeight: '1.6' }}>
                Orphanages post explicit, real-time needs like school supplies, clothing, and blankets. Donors contribute exact items or financial pledges.
              </p>
            </div>

            <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div
                style={{
                  width: '3rem',
                  height: '3rem',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--primary-light)',
                  color: 'var(--primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Calendar size={24} />
              </div>
              <h3 className="text-xl font-bold text-main">3. Volunteer Action</h3>
              <p className="text-secondary text-sm" style={{ lineHeight: '1.6' }}>
                Volunteers match their unique skills and availability to participate in community workshops, tutoring, and holiday events.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Urgent Item Requests Preview */}
      <section style={{ padding: '4.5rem 0', backgroundColor: 'var(--bg-main)', borderBottom: '1px solid var(--border)' }}>
        <div className="max-w-7xl">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2rem' }}>
            <div>
              <span className="text-xs font-bold text-primary" style={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Direct Impact
              </span>
              <h2 className="text-2xl md:text-3xl font-bold text-main" style={{ marginTop: '0.25rem' }}>
                Urgent Item Requests
              </h2>
            </div>
            <Link to="/requests" className="btn btn-outline btn-sm">
              View All Requests
              <ArrowRight size={14} />
            </Link>
          </div>

          {requests.length === 0 && !loading ? (
            <div className="card text-center text-muted" style={{ padding: '2.5rem' }}>
              No open requests at this moment.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {requests.map((req) => (
                <div key={req.id} className="card card-hover" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                      <StatusBadge status={req.urgency} />
                      <span className="text-xs font-semibold text-secondary">
                        Qty: {req.quantity_needed}
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-main" style={{ marginBottom: '0.375rem' }}>
                      {req.title}
                    </h3>
                    <p className="text-secondary text-xs" style={{ marginBottom: '0.75rem', lineHeight: '1.5' }}>
                      {req.description || 'Essential supplies needed for children.'}
                    </p>
                  </div>
                  <div style={{ borderTop: '1px solid var(--border)', paddingTop: '0.75rem', marginTop: '0.5rem' }}>
                    <Link to="/donate" state={{ orphanageId: req.orphanage_id, requestId: req.id }} className="btn btn-primary btn-sm" style={{ width: '100%' }}>
                      Fulfill Need
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Verified Orphanages Preview */}
      <section style={{ padding: '4.5rem 0', backgroundColor: '#ffffff', borderBottom: '1px solid var(--border)' }}>
        <div className="max-w-7xl">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2rem' }}>
            <div>
              <span className="text-xs font-bold text-teal" style={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Community Partners
              </span>
              <h2 className="text-2xl md:text-3xl font-bold text-main" style={{ marginTop: '0.25rem' }}>
                Verified Orphanage Homes
              </h2>
            </div>
            <Link to="/orphanages" className="btn btn-outline btn-sm">
              Explore All Orphanages
              <ArrowRight size={14} />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {orphanages.map((o) => (
              <div key={o.id} className="card card-hover" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                    <StatusBadge status={o.verification_status} />
                  </div>
                  <h3 className="text-lg font-bold text-main" style={{ marginBottom: '0.5rem' }}>
                    {o.name}
                  </h3>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', color: 'var(--text-secondary)' }}>
                    <MapPin size={15} style={{ flexShrink: 0, marginTop: '0.25rem' }} />
                    <span className="text-xs leading-relaxed">{o.address}</span>
                  </div>
                </div>
                <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1rem', marginTop: '1.25rem' }}>
                  <Link to={`/orphanages/${o.id}`} className="btn btn-outline btn-sm" style={{ width: '100%' }}>
                    View Profile & Needs
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Upcoming Volunteer Events */}
      <section style={{ padding: '4.5rem 0', backgroundColor: 'var(--bg-main)', borderBottom: '1px solid var(--border)' }}>
        <div className="max-w-7xl">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2rem' }}>
            <div>
              <span className="text-xs font-bold text-primary" style={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Volunteer Opportunities
              </span>
              <h2 className="text-2xl md:text-3xl font-bold text-main" style={{ marginTop: '0.25rem' }}>
                Upcoming Community Events
              </h2>
            </div>
            <Link to="/events" className="btn btn-outline btn-sm">
              All Events
              <ArrowRight size={14} />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {events.map((ev) => (
              <div key={ev.id} className="card card-hover" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                    <StatusBadge status={ev.status} />
                    <span className="text-xs text-muted">
                      {new Date(ev.event_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-main" style={{ marginBottom: '0.375rem' }}>
                    {ev.title}
                  </h3>
                  <p className="text-secondary text-xs" style={{ marginBottom: '0.75rem', lineHeight: '1.5' }}>
                    {ev.description || 'Community gathering and activities.'}
                  </p>
                  {ev.location && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                      <MapPin size={13} />
                      {ev.location}
                    </div>
                  )}
                </div>
                <div style={{ borderTop: '1px solid var(--border)', paddingTop: '0.75rem', marginTop: '1rem' }}>
                  <Link to={`/events/${ev.id}`} className="btn btn-primary btn-sm" style={{ width: '100%' }}>
                    View Event Details
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section style={{ padding: '5rem 0', backgroundColor: '#ffffff' }}>
        <div className="max-w-5xl text-center">
          <h2 className="text-3xl font-bold text-main" style={{ marginBottom: '1rem' }}>
            Ready to Make a Direct Difference?
          </h2>
          <p className="text-secondary text-base" style={{ maxWidth: '34rem', margin: '0 auto 2rem', lineHeight: '1.6' }}>
            Join thousands of donors, volunteers, and verified care centers transforming community support through transparency.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/register" className="btn btn-primary btn-lg">
              Create an Account
            </Link>
            <Link to="/orphanages" className="btn btn-outline btn-lg">
              Explore Directory
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
