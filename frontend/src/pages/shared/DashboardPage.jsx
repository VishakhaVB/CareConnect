import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { donationsApi } from '../../api/donations';
import { requestsApi } from '../../api/requests';
import { eventsApi } from '../../api/events';
import { adminApi } from '../../api/admin';
import { StatusBadge } from '../../components/common/StatusBadge';
import { LoadingState } from '../../components/common/LoadingState';
import {
  Heart,
  Package,
  Calendar,
  Building2,
  Award,
  Users,
  BarChart3,
  ArrowRight,
  ShieldCheck,
  PlusCircle,
  Clock,
} from 'lucide-react';

export function DashboardPage() {
  const { user, isDonor, isVolunteer, isAdmin, orphanage } = useAuth();

  // Donor state
  const [donations, setDonations] = useState([]);
  // Volunteer state
  const [participations, setParticipations] = useState([]);
  // Orphanage state
  const [receivedDonations, setReceivedDonations] = useState([]);
  const [myRequests, setMyRequests] = useState([]);
  // Admin state
  const [adminStats, setAdminStats] = useState(null);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboardData() {
      setLoading(true);
      try {
        if (isAdmin) {
          const stats = await adminApi.getStatistics().catch(() => null);
          setAdminStats(stats);
        }

        if (isDonor) {
          const myDons = await donationsApi.getMyDonations().catch(() => []);
          setDonations(myDons);
        }

        if (isVolunteer) {
          const parts = await eventsApi.getMyParticipations().catch(() => []);
          setParticipations(parts);
        }

        if (orphanage) {
          const [recDons, reqs] = await Promise.all([
            donationsApi.getReceivedDonations().catch(() => []),
            requestsApi.getMyRequests().catch(() => []),
          ]);
          setReceivedDonations(recDons);
          setMyRequests(reqs);
        }
      } finally {
        setLoading(false);
      }
    }

    loadDashboardData();
  }, [isAdmin, isDonor, isVolunteer, orphanage]);

  if (loading) return <LoadingState message="Preparing your dashboard..." />;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Header Banner */}
      <div
        className="card"
        style={{
          background: 'linear-gradient(135deg, #ffffff 0%, #f0f9ff 100%)',
          padding: '2rem',
          border: '1px solid #bae6fd',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.375rem' }}>
              <span className="badge badge-info" style={{ textTransform: 'capitalize' }}>
                {user?.role} Account
              </span>
              {orphanage && (
                <StatusBadge status={orphanage.verification_status} />
              )}
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-main">
              Welcome back, {user?.name}!
            </h1>
            <p className="text-secondary text-sm" style={{ marginTop: '0.25rem' }}>
              Here is what is happening across your CareConnect community activities.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            {isDonor && (
              <Link to="/donate" className="btn btn-primary btn-sm">
                <Heart size={15} />
                Make a Donation
              </Link>
            )}
            {isVolunteer && (
              <Link to="/events" className="btn btn-secondary btn-sm">
                <Calendar size={15} />
                Find Events
              </Link>
            )}
            {orphanage && (
              <Link to="/orphanage/requests" className="btn btn-outline btn-sm">
                <PlusCircle size={15} />
                New Item Request
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* ADMIN METRICS (if Admin) */}
      {isAdmin && adminStats && (
        <div>
          <h2 className="text-lg font-bold text-main" style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <BarChart3 size={20} className="text-primary" />
            Platform Statistics Overview
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <div className="card text-center" style={{ padding: '1.25rem 0.75rem' }}>
              <Users size={22} className="text-primary" style={{ margin: '0 auto 0.5rem' }} />
              <p className="text-2xl font-extrabold text-main">{adminStats.users}</p>
              <p className="text-xs text-muted font-medium">Total Users</p>
            </div>
            <div className="card text-center" style={{ padding: '1.25rem 0.75rem' }}>
              <Building2 size={22} className="text-teal" style={{ margin: '0 auto 0.5rem' }} />
              <p className="text-2xl font-extrabold text-main">{adminStats.orphanages}</p>
              <p className="text-xs text-muted font-medium">Orphanages</p>
            </div>
            <div className="card text-center" style={{ padding: '1.25rem 0.75rem' }}>
              <Users size={22} className="text-success" style={{ margin: '0 auto 0.5rem' }} />
              <p className="text-2xl font-extrabold text-main">{adminStats.volunteers}</p>
              <p className="text-xs text-muted font-medium">Volunteers</p>
            </div>
            <div className="card text-center" style={{ padding: '1.25rem 0.75rem' }}>
              <Heart size={22} className="text-danger" style={{ margin: '0 auto 0.5rem' }} />
              <p className="text-2xl font-extrabold text-main">{adminStats.donations}</p>
              <p className="text-xs text-muted font-medium">Donations</p>
            </div>
            <div className="card text-center" style={{ padding: '1.25rem 0.75rem' }}>
              <Package size={22} className="text-warning" style={{ margin: '0 auto 0.5rem' }} />
              <p className="text-2xl font-extrabold text-main">{adminStats.requests}</p>
              <p className="text-xs text-muted font-medium">Item Requests</p>
            </div>
            <div className="card text-center" style={{ padding: '1.25rem 0.75rem' }}>
              <Calendar size={22} className="text-primary" style={{ margin: '0 auto 0.5rem' }} />
              <p className="text-2xl font-extrabold text-main">{adminStats.events}</p>
              <p className="text-xs text-muted font-medium">Events</p>
            </div>
          </div>
        </div>
      )}

      {/* ORPHANAGE SUMMARY (if Orphanage Owner) */}
      {orphanage && (
        <div className="card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <div>
              <span className="text-xs font-bold text-teal" style={{ textTransform: 'uppercase' }}>Home Management</span>
              <h3 className="text-xl font-bold text-main">{orphanage.name}</h3>
            </div>
            <Link to="/orphanage/profile" className="btn btn-outline btn-sm">
              Manage Profile
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4" style={{ marginBottom: '1.5rem' }}>
            <div style={{ padding: '1rem', backgroundColor: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)' }}>
              <p className="text-xs text-muted">Active Needs</p>
              <p className="text-2xl font-bold text-main">{myRequests.filter((r) => r.status === 'open').length}</p>
            </div>
            <div style={{ padding: '1rem', backgroundColor: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)' }}>
              <p className="text-xs text-muted">Donations Received</p>
              <p className="text-2xl font-bold text-primary">{receivedDonations.length}</p>
            </div>
            <div style={{ padding: '1rem', backgroundColor: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)' }}>
              <p className="text-xs text-muted">Verification Status</p>
              <div style={{ marginTop: '0.25rem' }}>
                <StatusBadge status={orphanage.verification_status} />
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <Link to="/orphanage/requests" className="btn btn-outline btn-sm">
              <Package size={15} />
              Manage Item Requests
            </Link>
            <Link to="/orphanage/donations" className="btn btn-outline btn-sm">
              <Heart size={15} />
              View Received Donations
            </Link>
            <Link to="/orphanage/events" className="btn btn-outline btn-sm">
              <Calendar size={15} />
              Schedule Event
            </Link>
          </div>
        </div>
      )}

      {/* DONOR SECTION (if Donor) */}
      {isDonor && (
        <div className="card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <div>
              <h3 className="text-lg font-bold text-main">My Recent Donations</h3>
              <p className="text-xs text-muted">A record of your monetary pledges and item supply contributions.</p>
            </div>
            <Link to="/donations" className="btn btn-outline btn-sm">
              View All ({donations.length})
              <ArrowRight size={14} />
            </Link>
          </div>

          {donations.length === 0 ? (
            <div className="text-center" style={{ padding: '2rem 0' }}>
              <Heart size={32} className="text-muted" style={{ margin: '0 auto 0.75rem' }} />
              <p className="text-sm font-semibold text-main">No donations made yet</p>
              <p className="text-xs text-muted" style={{ marginBottom: '1rem' }}>Support verified care centers by fulfilling itemized needs or pledging funds.</p>
              <Link to="/donate" className="btn btn-primary btn-sm">
                Make Your First Donation
              </Link>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr>
                    <th>Type</th>
                    <th>Details</th>
                    <th>Status</th>
                    <th>Date</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {donations.slice(0, 5).map((don) => (
                    <tr key={don.id}>
                      <td>
                        <span className="font-semibold capitalize text-primary">{don.donation_type}</span>
                      </td>
                      <td>
                        {don.donation_type === 'money' ? (
                          <span className="font-bold">${don.amount}</span>
                        ) : (
                          <span>{don.quantity}x {don.item_description}</span>
                        )}
                      </td>
                      <td>
                        <StatusBadge status={don.status} />
                      </td>
                      <td className="text-xs text-muted">
                        {new Date(don.created_at).toLocaleDateString()}
                      </td>
                      <td>
                        <Link to={`/donations/${don.id}`} className="btn btn-outline btn-sm">
                          Receipt
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* VOLUNTEER SECTION (if Volunteer) */}
      {isVolunteer && (
        <div className="card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <div>
              <h3 className="text-lg font-bold text-main">Volunteer Engagements</h3>
              <p className="text-xs text-muted">Events and activities you have registered to support.</p>
            </div>
            <Link to="/volunteer/participations" className="btn btn-outline btn-sm">
              My Participations ({participations.length})
              <ArrowRight size={14} />
            </Link>
          </div>

          {participations.length === 0 ? (
            <div className="text-center" style={{ padding: '2rem 0' }}>
              <Calendar size={32} className="text-muted" style={{ margin: '0 auto 0.75rem' }} />
              <p className="text-sm font-semibold text-main">No event registrations</p>
              <p className="text-xs text-muted" style={{ marginBottom: '1rem' }}>Browse upcoming community events to volunteer your skills and time.</p>
              <Link to="/events" className="btn btn-secondary btn-sm">
                Browse Community Events
              </Link>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr>
                    <th>Event ID</th>
                    <th>Participation Status</th>
                    <th>Registered At</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {participations.slice(0, 5).map((part) => (
                    <tr key={part.id}>
                      <td className="font-semibold">Event #{part.event_id}</td>
                      <td><StatusBadge status={part.status} /></td>
                      <td className="text-xs text-muted">{new Date(part.joined_at).toLocaleDateString()}</td>
                      <td>
                        <Link to={`/events/${part.event_id}`} className="btn btn-outline btn-sm">
                          View Event
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
