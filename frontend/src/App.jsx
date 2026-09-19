import { BrowserRouter, Routes, Route, Link, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';

// Layouts and Guards
import { AppLayout, PublicLayout } from './components/layout/AppLayout';
import { ProtectedRoute } from './components/common/ProtectedRoute';
import { RoleGuard } from './components/common/RoleGuard';

// Public Pages
import { LandingPage } from './pages/public/LandingPage';
import { LoginPage } from './pages/public/LoginPage';
import { RegisterPage } from './pages/public/RegisterPage';
import { OrphanagesPage } from './pages/public/OrphanagesPage';
import { OrphanageDetailPage } from './pages/public/OrphanageDetailPage';
import { RequestsPage } from './pages/public/RequestsPage';
import { EventsPage } from './pages/public/EventsPage';
import { EventDetailPage } from './pages/public/EventDetailPage';
import { ImpactStoriesPage } from './pages/public/ImpactStoriesPage';

// Shared Authenticated Pages
import { DashboardPage } from './pages/shared/DashboardPage';
import { ProfilePage } from './pages/shared/ProfilePage';
import { NotificationsPage } from './pages/shared/NotificationsPage';
import { BadgesPage } from './pages/shared/BadgesPage';

// Donor Pages
import { DonatePage } from './pages/donor/DonatePage';
import { MyDonationsPage } from './pages/donor/MyDonationsPage';
import { DonationDetailPage } from './pages/donor/DonationDetailPage';

// Volunteer Pages
import { VolunteerProfilePage } from './pages/volunteer/VolunteerProfilePage';
import { MyParticipationsPage } from './pages/volunteer/MyParticipationsPage';

// Orphanage Pages
import { OrphanageProfilePage } from './pages/orphanage/OrphanageProfilePage';
import { ManageRequestsPage } from './pages/orphanage/ManageRequestsPage';
import { ManageEventsPage } from './pages/orphanage/ManageEventsPage';
import { ManageStoriesPage } from './pages/orphanage/ManageStoriesPage';
import { ReceivedDonationsPage } from './pages/orphanage/ReceivedDonationsPage';

// Admin Pages
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';
import { AdminUsersPage } from './pages/admin/AdminUsersPage';
import { AdminOrphanagesPage } from './pages/admin/AdminOrphanagesPage';
import { AdminBadgesPage } from './pages/admin/AdminBadgesPage';

export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>
          <Routes>
            {/* Public Layout */}
            <Route element={<PublicLayout />}>
              <Route path="/" element={<LandingPage />} />
              <Route path="/orphanages" element={<OrphanagesPage />} />
              <Route path="/orphanages/:id" element={<OrphanageDetailPage />} />
              <Route path="/requests" element={<RequestsPage />} />
              <Route path="/events" element={<EventsPage />} />
              <Route path="/events/:id" element={<EventDetailPage />} />
              <Route path="/impact-stories" element={<ImpactStoriesPage />} />
              <Route path="/stories" element={<ImpactStoriesPage />} />
            </Route>

            {/* Standalone Authentication Pages */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* Protected Authenticated Routes */}
            <Route element={<ProtectedRoute />}>
              <Route element={<AppLayout />}>
                {/* Shared User Area */}
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/notifications" element={<NotificationsPage />} />
                <Route path="/badges" element={<BadgesPage />} />

                {/* Donor Features */}
                <Route element={<RoleGuard allowedRoles={['donor', 'both', 'admin']} />}>
                  <Route path="/donate" element={<DonatePage />} />
                  <Route path="/donations" element={<MyDonationsPage />} />
                  <Route path="/donations/:id" element={<DonationDetailPage />} />
                </Route>

                {/* Volunteer Features */}
                <Route element={<RoleGuard allowedRoles={['volunteer', 'both', 'admin']} />}>
                  <Route path="/volunteer/profile" element={<VolunteerProfilePage />} />
                  <Route path="/volunteer/participations" element={<MyParticipationsPage />} />
                </Route>

                {/* Orphanage Registration / Profile Setup */}
                <Route element={<RoleGuard allowedRoles={['volunteer', 'both', 'admin']} />}>
                  <Route path="/orphanage/profile" element={<OrphanageProfilePage />} />
                </Route>

                {/* Orphanage Management Workspace (Requires Active Orphanage Profile) */}
                <Route element={<RoleGuard allowedRoles={['volunteer', 'both', 'admin']} requireOrphanage={true} />}>
                  <Route path="/orphanage/requests" element={<ManageRequestsPage />} />
                  <Route path="/orphanage/events" element={<ManageEventsPage />} />
                  <Route path="/orphanage/stories" element={<ManageStoriesPage />} />
                  <Route path="/orphanage/donations" element={<ReceivedDonationsPage />} />
                </Route>

                {/* Platform Administration */}
                <Route element={<RoleGuard allowedRoles={['admin']} />}>
                  <Route path="/admin" element={<AdminDashboardPage />} />
                  <Route path="/admin/users" element={<AdminUsersPage />} />
                  <Route path="/admin/orphanages" element={<AdminOrphanagesPage />} />
                  <Route path="/admin/badges" element={<AdminBadgesPage />} />
                </Route>
              </Route>
            </Route>

            {/* 404 Not Found Catch-All */}
            <Route
              path="*"
              element={
                <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
                  <div className="card text-center" style={{ maxWidth: '28rem', padding: '3.5rem 2rem' }}>
                    <h1 className="text-4xl font-extrabold text-primary" style={{ marginBottom: '0.5rem' }}>
                      404
                    </h1>
                    <h2 className="text-xl font-bold text-main" style={{ marginBottom: '0.75rem' }}>
                      Page Not Found
                    </h2>
                    <p className="text-muted text-sm" style={{ marginBottom: '2rem' }}>
                      The page you are looking for does not exist or has moved.
                    </p>
                    <Link to="/" className="btn btn-primary" style={{ margin: '0 auto' }}>
                      Return to Homepage
                    </Link>
                  </div>
                </div>
              }
            />
          </Routes>
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  );
}
