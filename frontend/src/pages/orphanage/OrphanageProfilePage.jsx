import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { orphanagesApi } from '../../api/orphanages';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { LoadingState } from '../../components/common/LoadingState';
import { StatusBadge } from '../../components/common/StatusBadge';
import {
  Building2,
  MapPin,
  ShieldCheck,
  Clock,
  AlertCircle,
  Save,
  Package,
  Calendar,
  Heart,
  FileText,
  CheckCircle2,
} from 'lucide-react';

export function OrphanageProfilePage() {
  const { user, orphanage, refreshOrphanage } = useAuth();
  const { showSuccess, showError } = useToast();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    address: '',
  });

  useEffect(() => {
    async function init() {
      try {
        setLoading(true);
        if (orphanage) {
          setFormData({
            name: orphanage.name || '',
            address: orphanage.address || '',
          });
        } else {
          // Attempt to fetch from API in case context is still hydrating
          try {
            const data = await orphanagesApi.getMyOrphanage();
            if (data) {
              setFormData({
                name: data.name || '',
                address: data.address || '',
              });
              await refreshOrphanage();
            }
          } catch (e) {
            // 404 is expected if profile has not been created yet
          }
        }
      } finally {
        setLoading(false);
      }
    }
    init();
  }, [orphanage]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.address.trim()) {
      showError('Please fill in both the orphanage name and street address.');
      return;
    }

    setSubmitting(true);
    try {
      if (orphanage) {
        // Update
        await orphanagesApi.updateMyOrphanage({
          name: formData.name.trim(),
          address: formData.address.trim(),
        });
        showSuccess('Orphanage profile updated successfully!');
      } else {
        // Create
        await orphanagesApi.create({
          name: formData.name.trim(),
          address: formData.address.trim(),
        });
        showSuccess('Orphanage registered successfully!');
      }
      await refreshOrphanage();
    } catch (err) {
      showError(err.message || 'Failed to save orphanage details.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <LoadingState message="Loading orphanage profile..." />;
  }

  // If user has role 'donor', explain permission restriction
  if (user?.role === 'donor') {
    return (
      <div className="card text-center" style={{ maxWidth: '36rem', margin: '4rem auto', padding: '3rem 2rem' }}>
        <div
          style={{
            width: '4rem',
            height: '4rem',
            borderRadius: 'var(--radius-full)',
            backgroundColor: 'var(--warning-bg)',
            color: 'var(--warning)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.25rem',
          }}
        >
          <Building2 size={32} />
        </div>
        <h2 className="text-2xl font-bold text-main">Donor Account Detected</h2>
        <p className="text-muted" style={{ marginTop: '0.75rem' }}>
          Your account is currently registered as a <strong>Donor</strong>. Orphanage profiles can only be registered by accounts with the <strong>both</strong>, <strong>volunteer</strong>, or <strong>admin</strong> role.
        </p>
        <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem', justifyContent: 'center' }}>
          <Link to="/donate" className="btn btn-primary">
            Make a Donation
          </Link>
          <Link to="/dashboard" className="btn btn-outline">
            Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in" style={{ maxWidth: '48rem', margin: '0 auto' }}>
      <div>
        <h1 className="text-3xl font-bold text-main">
          {orphanage ? 'Orphanage Profile' : 'Register Orphanage'}
        </h1>
        <p className="text-muted" style={{ marginTop: '0.25rem' }}>
          {orphanage
            ? 'Manage your care home profile, verification status, and organizational details.'
            : 'Register your shelter or care home on CareConnect to start receiving donations and volunteer support.'}
        </p>
      </div>

      {orphanage && (
        <>
          {/* Verification Status Card */}
          <div
            className="card"
            style={{
              backgroundColor:
                orphanage.verification_status === 'verified'
                  ? 'var(--success-bg)'
                  : orphanage.verification_status === 'rejected'
                  ? 'var(--danger-bg)'
                  : 'var(--warning-bg)',
              borderColor:
                orphanage.verification_status === 'verified'
                  ? 'var(--success)'
                  : orphanage.verification_status === 'rejected'
                  ? 'var(--danger)'
                  : 'var(--warning)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '1rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <ShieldCheck
                size={32}
                style={{
                  color:
                    orphanage.verification_status === 'verified'
                      ? 'var(--success)'
                      : orphanage.verification_status === 'rejected'
                      ? 'var(--danger)'
                      : 'var(--warning)',
                }}
              />
              <div>
                <p className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                  Platform Verification Status
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.25rem' }}>
                  <span className="font-bold text-lg text-main capitalize">
                    {orphanage.verification_status}
                  </span>
                  <StatusBadge status={orphanage.verification_status} />
                </div>
              </div>
            </div>

            <div style={{ maxWidth: '24rem', fontSize: '0.875rem' }} className="text-secondary">
              {orphanage.verification_status === 'verified' && (
                <p>Your orphanage is verified! Donors can view and donate directly to your public page.</p>
              )}
              {orphanage.verification_status === 'pending' && (
                <p>Pending administrative verification. You can still add item requests and schedule community events.</p>
              )}
              {orphanage.verification_status === 'rejected' && (
                <p>Verification was not approved. Please review your submitted details or contact administrator support.</p>
              )}
            </div>
          </div>

          {/* Quick Management Shortcuts */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(10rem, 1fr))', gap: '1rem' }}>
            <Link to="/orphanage/requests" className="card text-center hover:border-primary transition-colors">
              <Package size={24} className="text-primary" style={{ margin: '0 auto 0.5rem' }} />
              <p className="font-bold text-main text-sm">Manage Needs</p>
              <p className="text-xs text-muted">Item requests</p>
            </Link>

            <Link to="/orphanage/donations" className="card text-center hover:border-primary transition-colors">
              <Heart size={24} className="text-danger" style={{ margin: '0 auto 0.5rem' }} />
              <p className="font-bold text-main text-sm">Donations</p>
              <p className="text-xs text-muted">Received items & funds</p>
            </Link>

            <Link to="/orphanage/events" className="card text-center hover:border-primary transition-colors">
              <Calendar size={24} className="text-secondary" style={{ margin: '0 auto 0.5rem' }} />
              <p className="font-bold text-main text-sm">Events</p>
              <p className="text-xs text-muted">Drives & workshops</p>
            </Link>

            <Link to="/orphanage/stories" className="card text-center hover:border-primary transition-colors">
              <FileText size={24} className="text-warning" style={{ margin: '0 auto 0.5rem' }} />
              <p className="font-bold text-main text-sm">Stories</p>
              <p className="text-xs text-muted">Impact updates</p>
            </Link>
          </div>
        </>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="card space-y-5">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
          <div
            style={{
              padding: '0.75rem',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--primary-light)',
              color: 'var(--primary)',
            }}
          >
            <Building2 size={24} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-main">
              {orphanage ? 'Organization Information' : 'New Orphanage Registration'}
            </h2>
            <p className="text-xs text-muted">
              Ensure contact information is accurate for public transparency
            </p>
          </div>
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="name">
            Orphanage / Organization Name <span className="text-danger">*</span>
          </label>
          <input
            id="name"
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="e.g. Hope Haven Children's Home"
            maxLength={150}
            required
            className="form-input"
          />
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="address">
            Full Physical Address <span className="text-danger">*</span>
          </label>
          <textarea
            id="address"
            name="address"
            value={formData.address}
            onChange={handleChange}
            placeholder="e.g. 142 Sunshine Boulevard, North Ward, Metropolis, 560001"
            rows={3}
            required
            className="form-textarea"
          />
          <p className="text-xs text-muted" style={{ marginTop: '0.375rem' }}>
            Provide street, area, city, and postal code for donor verification and delivery.
          </p>
        </div>

        <div style={{ paddingTop: '1rem', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'flex-end' }}>
          <button type="submit" disabled={submitting} className="btn btn-primary">
            {submitting ? (
              'Saving...'
            ) : (
              <>
                <Save size={16} />
                {orphanage ? 'Update Profile' : 'Register Orphanage'}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
