import { useState, useEffect } from 'react';
import { badgesApi } from '../../api/badges';
import { usersApi } from '../../api/users';
import { useAuth } from '../../context/AuthContext';
import { LoadingState } from '../../components/common/LoadingState';
import { ErrorState } from '../../components/common/ErrorState';
import { Award, CheckCircle2, ShieldAlert } from 'lucide-react';

export function BadgesPage() {
  const { isAuthenticated } = useAuth();
  const [allBadges, setAllBadges] = useState([]);
  const [myBadges, setMyBadges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadBadges = async () => {
    setLoading(true);
    setError('');
    try {
      const badges = await badgesApi.list();
      setAllBadges(badges);

      if (isAuthenticated) {
        const userBadges = await usersApi.getMyBadges().catch(() => []);
        setMyBadges(userBadges);
      }
    } catch (err) {
      setError(err.message || 'Failed to load platform badges.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBadges();
  }, [isAuthenticated]);

  if (loading) return <LoadingState message="Loading community badges..." />;
  if (error) return <ErrorState message={error} onRetry={loadBadges} />;

  const earnedBadgeIds = new Set(myBadges.map((b) => b.badge_id));

  return (
    <div className="max-w-6xl" style={{ padding: '2rem 1.5rem' }}>
      <div style={{ marginBottom: '2.5rem' }}>
        <h1 className="text-3xl font-bold text-main" style={{ marginBottom: '0.375rem' }}>
          Community Badges & Honors
        </h1>
        <p className="text-secondary text-sm">
          Recognizing outstanding contributions from generous donors, active volunteers, and dedicated community members.
        </p>
      </div>

      {/* My Badges Highlight */}
      {isAuthenticated && (
        <div style={{ marginBottom: '3rem' }}>
          <h2 className="text-xl font-bold text-main" style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Award size={20} className="text-primary" />
            My Earned Badges ({myBadges.length})
          </h2>

          {myBadges.length === 0 ? (
            <div className="card text-center" style={{ padding: '2rem' }}>
              <p className="text-sm text-secondary font-medium">You haven&apos;t received any badges yet.</p>
              <p className="text-xs text-muted" style={{ marginTop: '0.25rem' }}>
                Participate in volunteer events or contribute donations to earn community recognitions.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {myBadges.map((ub) => (
                <div
                  key={ub.id}
                  className="card"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                    padding: '1.25rem',
                    border: '2px solid #bae6fd',
                    backgroundColor: '#f0f9ff',
                  }}
                >
                  <div
                    style={{
                      width: '3.25rem',
                      height: '3.25rem',
                      borderRadius: 'var(--radius-full)',
                      backgroundColor: 'var(--primary)',
                      color: '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <Award size={24} />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-main">{ub.badge?.name || `Badge #${ub.badge_id}`}</h3>
                    <p className="text-xs text-secondary" style={{ marginTop: '0.125rem' }}>
                      {ub.badge?.description || 'Awarded for contributions.'}
                    </p>
                    <span className="text-xs text-muted" style={{ display: 'block', marginTop: '0.375rem' }}>
                      Earned {new Date(ub.awarded_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Catalog of all badges */}
      <div>
        <h2 className="text-xl font-bold text-main" style={{ marginBottom: '1rem' }}>
          All Platform Badges
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {allBadges.map((badge) => {
            const isEarned = earnedBadgeIds.has(badge.id);
            return (
              <div
                key={badge.id}
                className="card"
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '1rem',
                  padding: '1.5rem',
                  opacity: isAuthenticated && !isEarned ? 0.75 : 1,
                }}
              >
                <div
                  style={{
                    width: '3rem',
                    height: '3rem',
                    borderRadius: 'var(--radius-full)',
                    backgroundColor: isEarned ? 'var(--primary)' : 'var(--bg-subtle)',
                    color: isEarned ? '#ffffff' : 'var(--text-muted)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <Award size={22} />
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <h3 className="text-base font-bold text-main">{badge.name}</h3>
                    {isEarned && (
                      <span className="badge badge-verified" style={{ fontSize: '0.6875rem' }}>
                        Earned
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-secondary" style={{ marginTop: '0.25rem', lineHeight: '1.5' }}>
                    {badge.description || 'Awarded to community contributors.'}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
