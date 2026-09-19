import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { orphanagesApi } from '../../api/orphanages';
import { requestsApi } from '../../api/requests';
import { reviewsApi } from '../../api/reviews';
import { eventsApi } from '../../api/events';
import { impactStoriesApi } from '../../api/impactStories';
import { StatusBadge } from '../../components/common/StatusBadge';
import { LoadingState } from '../../components/common/LoadingState';
import { EmptyState } from '../../components/common/EmptyState';
import { ErrorState } from '../../components/common/ErrorState';
import {
  Building2,
  MapPin,
  Heart,
  Package,
  Calendar,
  Star,
  FileText,
  MessageSquare,
  AlertCircle,
} from 'lucide-react';

export function OrphanageDetailPage() {
  const { id } = useParams();
  const { user, isDonor } = useAuth();
  const toast = useToast();

  const [orphanage, setOrphanage] = useState(null);
  const [requests, setRequests] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [events, setEvents] = useState([]);
  const [stories, setStories] = useState([]);
  const [activeTab, setActiveTab] = useState('requests');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Review form state
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewError, setReviewError] = useState('');

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      const orph = await orphanagesApi.getById(id);
      setOrphanage(orph);

      const [reqData, revData, evData, storyData] = await Promise.all([
        requestsApi.list({ orphanageId: id }).catch(() => []),
        reviewsApi.listByOrphanage(id).catch(() => []),
        eventsApi.list({ orphanageId: id }).catch(() => []),
        impactStoriesApi.list(id).catch(() => []),
      ]);

      setRequests(reqData);
      setReviews(revData);
      setEvents(evData);
      setStories(storyData);
    } catch (err) {
      setError(err.message || 'Failed to load orphanage details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [id]);

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    setReviewError('');

    if (!user) {
      setReviewError('You must be signed in as a donor to submit a review.');
      return;
    }

    if (orphanage?.user_id === user.id) {
      setReviewError('You cannot review your own orphanage.');
      return;
    }

    setSubmittingReview(true);
    try {
      await reviewsApi.create(id, {
        rating: Number(reviewRating),
        comment: reviewComment.trim() || undefined,
      });
      toast.success('Thank you! Your review has been published.');
      setReviewComment('');
      // Reload reviews
      const updatedReviews = await reviewsApi.listByOrphanage(id);
      setReviews(updatedReviews);
    } catch (err) {
      setReviewError(err.message || 'Failed to submit review.');
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) return <LoadingState message="Loading orphanage profile..." />;
  if (error) return <ErrorState message={error} onRetry={loadData} />;
  if (!orphanage) return <EmptyState title="Orphanage not found" />;

  const isOwner = user && orphanage.user_id === user.id;
  const userHasReviewed = user && reviews.some((r) => r.user_id === user.id);

  return (
    <div className="max-w-7xl" style={{ padding: '2.5rem 1.5rem' }}>
      {/* Profile Header Banner */}
      <div className="card" style={{ padding: '2.5rem 2rem', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }} className="md:flex-row md:items-center md:justify-between">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
              <StatusBadge status={orphanage.verification_status} />
              <span className="text-xs text-muted">ID: #{orphanage.id}</span>
              <span className="text-xs text-muted">• Joined {new Date(orphanage.created_at).toLocaleDateString()}</span>
            </div>
            <h1 className="text-3xl font-extrabold text-main" style={{ marginBottom: '0.5rem' }}>
              {orphanage.name}
            </h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)' }}>
              <MapPin size={18} className="text-primary" />
              <span className="text-sm font-medium">{orphanage.address}</span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <Link to="/donate" state={{ orphanageId: orphanage.id }} className="btn btn-primary">
              <Heart size={16} />
              Donate to this Home
            </Link>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ borderBottom: '1px solid var(--border)', marginBottom: '2rem', display: 'flex', gap: '1rem', overflowX: 'auto' }}>
        <button
          onClick={() => setActiveTab('requests')}
          style={{
            padding: '0.75rem 0.5rem',
            fontSize: '0.9375rem',
            fontWeight: 600,
            borderBottom: activeTab === 'requests' ? '2px solid var(--primary)' : '2px solid transparent',
            color: activeTab === 'requests' ? 'var(--primary)' : 'var(--text-secondary)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}
        >
          <Package size={17} />
          Needs & Requests ({requests.length})
        </button>

        <button
          onClick={() => setActiveTab('reviews')}
          style={{
            padding: '0.75rem 0.5rem',
            fontSize: '0.9375rem',
            fontWeight: 600,
            borderBottom: activeTab === 'reviews' ? '2px solid var(--primary)' : '2px solid transparent',
            color: activeTab === 'reviews' ? 'var(--primary)' : 'var(--text-secondary)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}
        >
          <Star size={17} />
          Community Reviews ({reviews.length})
        </button>

        <button
          onClick={() => setActiveTab('events')}
          style={{
            padding: '0.75rem 0.5rem',
            fontSize: '0.9375rem',
            fontWeight: 600,
            borderBottom: activeTab === 'events' ? '2px solid var(--primary)' : '2px solid transparent',
            color: activeTab === 'events' ? 'var(--primary)' : 'var(--text-secondary)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}
        >
          <Calendar size={17} />
          Events ({events.length})
        </button>

        <button
          onClick={() => setActiveTab('stories')}
          style={{
            padding: '0.75rem 0.5rem',
            fontSize: '0.9375rem',
            fontWeight: 600,
            borderBottom: activeTab === 'stories' ? '2px solid var(--primary)' : '2px solid transparent',
            color: activeTab === 'stories' ? 'var(--primary)' : 'var(--text-secondary)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}
        >
          <FileText size={17} />
          Impact Stories ({stories.length})
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'requests' && (
        <div>
          {requests.length === 0 ? (
            <EmptyState
              icon={Package}
              title="No active requests"
              description="This orphanage has not posted any active item requests at this moment."
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {requests.map((req) => (
                <div key={req.id} className="card card-hover" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                      <StatusBadge status={req.urgency} />
                      <StatusBadge status={req.status} />
                    </div>
                    <h3 className="text-lg font-bold text-main" style={{ marginBottom: '0.375rem' }}>
                      {req.title}
                    </h3>
                    <p className="text-secondary text-xs" style={{ marginBottom: '0.875rem', lineHeight: '1.5' }}>
                      {req.description || 'Essential supplies required.'}
                    </p>
                    <div style={{ padding: '0.625rem 0.875rem', backgroundColor: 'var(--bg-subtle)', borderRadius: 'var(--radius-sm)', fontSize: '0.8125rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span className="text-muted">Item Type:</span>
                        <span className="font-semibold text-main capitalize">{req.item_type}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.25rem' }}>
                        <span className="text-muted">Quantity Needed:</span>
                        <span className="font-bold text-primary">{req.quantity_needed}</span>
                      </div>
                    </div>
                  </div>

                  <div style={{ borderTop: '1px solid var(--border)', paddingTop: '0.875rem', marginTop: '1rem' }}>
                    <Link
                      to="/donate"
                      state={{ orphanageId: orphanage.id, requestId: req.id }}
                      className="btn btn-primary btn-sm"
                      style={{ width: '100%' }}
                    >
                      Fulfill This Request
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'reviews' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2">
            <h3 className="text-xl font-bold text-main" style={{ marginBottom: '1.25rem' }}>
              Donor Reviews
            </h3>

            {reviews.length === 0 ? (
              <EmptyState
                icon={MessageSquare}
                title="No reviews yet"
                description="Be the first donor to share your feedback for this orphanage."
              />
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {reviews.map((r) => (
                  <div key={r.id} className="card" style={{ padding: '1.25rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                      <div style={{ display: 'flex', gap: '0.25rem' }}>
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star
                            key={s}
                            size={16}
                            fill={s <= r.rating ? '#f59e0b' : 'transparent'}
                            color={s <= r.rating ? '#f59e0b' : '#cbd5e1'}
                          />
                        ))}
                      </div>
                      <span className="text-xs text-muted">
                        {new Date(r.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-secondary text-sm" style={{ lineHeight: '1.5' }}>
                      {r.comment || 'No comment provided.'}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Submit Review Box */}
          <div>
            <div className="card" style={{ padding: '1.5rem' }}>
              <h4 className="text-base font-bold text-main" style={{ marginBottom: '0.75rem' }}>
                Leave a Review
              </h4>

              {!user ? (
                <div className="text-center" style={{ padding: '1rem 0' }}>
                  <p className="text-xs text-muted" style={{ marginBottom: '0.75rem' }}>
                    Sign in with a Donor account to leave a community review.
                  </p>
                  <Link to="/login" className="btn btn-outline btn-sm" style={{ width: '100%' }}>
                    Log In to Review
                  </Link>
                </div>
              ) : isOwner ? (
                <p className="text-xs text-muted" style={{ padding: '1rem 0' }}>
                  Orphanage owners cannot submit reviews for their own home.
                </p>
              ) : !isDonor ? (
                <p className="text-xs text-muted" style={{ padding: '1rem 0' }}>
                  Only donor or volunteer-donor accounts can submit reviews.
                </p>
              ) : userHasReviewed ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--success)', padding: '1rem 0', fontSize: '0.875rem' }}>
                  <Star size={16} />
                  <span>You have already submitted a review for this orphanage.</span>
                </div>
              ) : (
                <form onSubmit={handleReviewSubmit}>
                  {reviewError && (
                    <div
                      style={{
                        padding: '0.625rem',
                        backgroundColor: 'var(--danger-bg)',
                        color: 'var(--danger)',
                        borderRadius: 'var(--radius-sm)',
                        fontSize: '0.75rem',
                        marginBottom: '0.75rem',
                        display: 'flex',
                        gap: '0.375rem',
                      }}
                    >
                      <AlertCircle size={14} style={{ flexShrink: 0 }} />
                      <span>{reviewError}</span>
                    </div>
                  )}

                  <div className="form-group">
                    <label className="form-label" htmlFor="rating">
                      Rating (1 - 5)
                    </label>
                    <select
                      id="rating"
                      className="form-select"
                      value={reviewRating}
                      onChange={(e) => setReviewRating(e.target.value)}
                      disabled={submittingReview}
                    >
                      <option value="5">5 - Outstanding</option>
                      <option value="4">4 - Very Good</option>
                      <option value="3">3 - Good</option>
                      <option value="2">2 - Fair</option>
                      <option value="1">1 - Needs Attention</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="comment">
                      Comments (Optional)
                    </label>
                    <textarea
                      id="comment"
                      className="form-textarea"
                      placeholder="Share your experience donating to or communicating with this home..."
                      value={reviewComment}
                      onChange={(e) => setReviewComment(e.target.value)}
                      disabled={submittingReview}
                    />
                  </div>

                  <button
                    type="submit"
                    className="btn btn-primary btn-sm"
                    style={{ width: '100%' }}
                    disabled={submittingReview}
                  >
                    {submittingReview ? <span className="spinner" /> : 'Post Review'}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'events' && (
        <div>
          {events.length === 0 ? (
            <EmptyState
              icon={Calendar}
              title="No upcoming events"
              description="This orphanage has not scheduled any community events right now."
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {events.map((ev) => (
                <div key={ev.id} className="card card-hover" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                      <StatusBadge status={ev.status} />
                      <span className="text-xs text-muted">
                        {new Date(ev.event_date).toLocaleDateString()}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-main" style={{ marginBottom: '0.375rem' }}>
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
                    <Link to={`/events/${ev.id}`} className="btn btn-outline btn-sm" style={{ width: '100%' }}>
                      Event Details & Volunteer
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'stories' && (
        <div>
          {stories.length === 0 ? (
            <EmptyState
              icon={FileText}
              title="No impact stories published"
              description="This orphanage has not shared any impact stories yet."
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {stories.map((story) => (
                <div key={story.id} className="card card-hover" style={{ display: 'flex', flexDirection: 'column' }}>
                  {story.image_url && (
                    <img
                      src={story.image_url}
                      alt={story.title}
                      style={{
                        width: '100%',
                        height: '11rem',
                        objectFit: 'cover',
                        borderRadius: 'var(--radius-md)',
                        marginBottom: '1rem',
                      }}
                      onError={(e) => { e.target.style.display = 'none'; }}
                    />
                  )}
                  <span className="text-xs text-muted" style={{ marginBottom: '0.375rem' }}>
                    {new Date(story.created_at).toLocaleDateString()}
                  </span>
                  <h3 className="text-lg font-bold text-main" style={{ marginBottom: '0.5rem' }}>
                    {story.title}
                  </h3>
                  <p className="text-secondary text-xs leading-relaxed" style={{ whiteSpace: 'pre-line' }}>
                    {story.content}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
