import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { donationsApi } from '../../api/donations';
import { orphanagesApi } from '../../api/orphanages';
import { requestsApi } from '../../api/requests';
import { LoadingState } from '../../components/common/LoadingState';
import { ErrorState } from '../../components/common/ErrorState';
import { StatusBadge } from '../../components/common/StatusBadge';
import {
  ArrowLeft,
  Receipt,
  Heart,
  Calendar,
  Building2,
  Printer,
  CheckCircle2,
  FileText,
  DollarSign,
  Package,
} from 'lucide-react';

export function DonationDetailPage() {
  const { id } = useParams();
  const [donation, setDonation] = useState(null);
  const [receipt, setReceipt] = useState(null);
  const [orphanage, setOrphanage] = useState(null);
  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadDetails() {
      try {
        setLoading(true);
        setError(null);

        const don = await donationsApi.getById(id);
        setDonation(don);

        // Concurrently fetch receipt and orphanage
        const [rcpt, orph] = await Promise.all([
          donationsApi.getReceipt(id).catch((err) => {
            console.warn('No receipt found yet', err);
            return null;
          }),
          orphanagesApi.getById(don.orphanage_id).catch(() => null),
        ]);

        setReceipt(rcpt);
        setOrphanage(orph);

        if (don.request_id) {
          try {
            const reqData = await requestsApi.getById(don.request_id);
            setRequest(reqData);
          } catch (e) {
            console.warn('Could not load request details', e);
          }
        }
      } catch (err) {
        setError(err.message || 'Unable to load donation details.');
      } finally {
        setLoading(false);
      }
    }

    if (id) {
      loadDetails();
    }
  }, [id]);

  if (loading) {
    return <LoadingState message="Fetching donation details and receipt..." />;
  }

  if (error || !donation) {
    return (
      <ErrorState
        title="Donation Not Found"
        message={error || 'The requested donation record could not be retrieved.'}
        onRetry={() => window.location.reload()}
      />
    );
  }

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 animate-fade-in" style={{ maxWidth: '48rem', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Link to="/donations" className="btn btn-outline btn-sm">
          <ArrowLeft size={16} />
          Back to My Donations
        </Link>
        <button type="button" onClick={handlePrint} className="btn btn-outline btn-sm">
          <Printer size={16} />
          Print Receipt
        </button>
      </div>

      {/* Donation Overview Header */}
      <div className="card space-y-4">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
              <h1 className="text-2xl font-bold text-main">Donation #{donation.id}</h1>
              <StatusBadge status={donation.status} />
            </div>
            <p className="text-sm text-muted">
              Submitted on{' '}
              {new Date(donation.created_at).toLocaleDateString(undefined, {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </p>
          </div>

          <div className="text-right">
            <span className="text-xs text-muted uppercase font-bold">Contribution Type</span>
            <p className="font-bold text-lg text-main capitalize">{donation.donation_type}</p>
          </div>
        </div>

        <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(14rem, 1fr))', gap: '1rem' }}>
          <div>
            <span className="text-xs text-muted uppercase font-bold">Recipient Organization</span>
            <p className="font-bold text-main">{orphanage ? orphanage.name : `Orphanage #${donation.orphanage_id}`}</p>
            {orphanage && <p className="text-xs text-muted">{orphanage.address}</p>}
          </div>

          <div>
            <span className="text-xs text-muted uppercase font-bold">Contribution Details</span>
            {donation.donation_type === 'money' ? (
              <p className="text-xl font-bold text-primary">${parseFloat(donation.amount).toFixed(2)} USD</p>
            ) : (
              <div>
                <p className="font-bold text-main">{donation.quantity} units</p>
                <p className="text-sm text-secondary">{donation.item_description}</p>
              </div>
            )}
          </div>

          {request && (
            <div>
              <span className="text-xs text-muted uppercase font-bold">Linked Need Request</span>
              <p className="font-bold text-main">{request.title}</p>
              <p className="text-xs text-muted">{request.item_type} ({request.urgency} urgency)</p>
            </div>
          )}
        </div>
      </div>

      {/* Official Receipt Card */}
      {receipt ? (
        <div
          className="card"
          style={{
            border: '2px dashed var(--primary)',
            backgroundColor: '#ffffff',
            padding: '2.5rem 2rem',
          }}
          id="receipt-print-area"
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '2px solid var(--border)', paddingBottom: '1.5rem', marginBottom: '1.5rem' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary)', fontWeight: 800, fontSize: '1.25rem' }}>
                <Heart size={22} fill="currentColor" />
                CareConnect
              </div>
              <p className="text-xs text-muted" style={{ marginTop: '0.25rem' }}>
                Community Orphanage & Donation Support
              </p>
            </div>

            <div style={{ textAlign: 'right' }}>
              <span className="badge badge-verified" style={{ fontSize: '0.75rem' }}>
                Official Receipt
              </span>
              <p className="font-mono text-sm font-bold text-main" style={{ marginTop: '0.375rem' }}>
                {receipt.receipt_number}
              </p>
              <p className="text-xs text-muted">
                Issued:{' '}
                {new Date(receipt.issued_at).toLocaleDateString(undefined, {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                })}
              </p>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '1.5rem' }}>
            <div>
              <p className="text-xs text-muted uppercase font-bold">Beneficiary</p>
              <p className="font-bold text-main text-base" style={{ marginTop: '0.25rem' }}>
                {orphanage?.name || `Care Home #${donation.orphanage_id}`}
              </p>
              <p className="text-sm text-secondary">{orphanage?.address}</p>
              <p className="text-xs text-muted" style={{ marginTop: '0.25rem' }}>
                Status: {orphanage?.verification_status}
              </p>
            </div>

            <div>
              <p className="text-xs text-muted uppercase font-bold">Donation Information</p>
              <p className="text-sm text-secondary" style={{ marginTop: '0.25rem' }}>
                Receipt ID: #{receipt.id}
              </p>
              <p className="text-sm text-secondary">
                Donation Ref: #{donation.id}
              </p>
              <p className="text-sm text-secondary capitalize">
                Mode: {donation.donation_type} donation
              </p>
            </div>
          </div>

          {/* Value Table */}
          <div style={{ backgroundColor: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)', padding: '1rem 1.25rem', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <p className="font-bold text-main">
                  {donation.donation_type === 'money'
                    ? 'Monetary Gift Contribution'
                    : `In-Kind Item Donation (${donation.quantity} units)`}
                </p>
                <p className="text-xs text-muted">
                  {donation.donation_type === 'money'
                    ? 'Direct charitable grant for essential living supplies'
                    : donation.item_description}
                </p>
              </div>
              <p className="text-xl font-bold text-main">
                {donation.donation_type === 'money'
                  ? `$${parseFloat(donation.amount).toFixed(2)}`
                  : `${donation.quantity} Qty`}
              </p>
            </div>
          </div>

          <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <p className="text-xs text-muted" style={{ maxWidth: '28rem' }}>
              Thank you for making a real difference. This receipt confirms your contribution was recorded in the CareConnect ledger.
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', color: 'var(--success)', fontWeight: 600, fontSize: '0.875rem' }}>
              <CheckCircle2 size={16} />
              Verified Record
            </div>
          </div>
        </div>
      ) : (
        <div className="card text-center" style={{ padding: '2.5rem 1rem' }}>
          <Receipt size={32} className="text-muted" style={{ margin: '0 auto 0.75rem' }} />
          <h3 className="text-lg font-bold text-main">Receipt Pending</h3>
          <p className="text-muted text-sm" style={{ maxWidth: '24rem', margin: '0.25rem auto 0' }}>
            The receipt for this donation will be automatically generated as soon as processing completes.
          </p>
        </div>
      )}
    </div>
  );
}
