import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { impactStoriesApi } from '../../api/impactStories';
import { LoadingState } from '../../components/common/LoadingState';
import { EmptyState } from '../../components/common/EmptyState';
import { ErrorState } from '../../components/common/ErrorState';
import { FileText, Search, Calendar, Building2 } from 'lucide-react';

export function ImpactStoriesPage() {
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const loadStories = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await impactStoriesApi.list();
      setStories(data);
    } catch (err) {
      setError(err.message || 'Failed to load impact stories.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStories();
  }, []);

  const filtered = stories.filter((s) => {
    const term = searchTerm.toLowerCase();
    return s.title.toLowerCase().includes(term) || s.content.toLowerCase().includes(term);
  });

  return (
    <div className="max-w-7xl" style={{ padding: '2.5rem 1.5rem' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 className="text-3xl font-extrabold text-main" style={{ marginBottom: '0.375rem' }}>
          Real Impact Stories
        </h1>
        <p className="text-secondary text-base">
          Read directly from care homes how your donations and volunteer hours are transforming children&apos;s lives.
        </p>
      </div>

      {/* Search Bar */}
      <div
        className="card"
        style={{
          padding: '1rem 1.25rem',
          marginBottom: '2rem',
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <div style={{ position: 'relative', width: '100%', maxWidth: '24rem' }}>
          <Search
            size={18}
            style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}
          />
          <input
            type="text"
            className="form-input"
            style={{ paddingLeft: '2.5rem' }}
            placeholder="Search stories by keyword..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <LoadingState message="Loading impact stories..." />
      ) : error ? (
        <ErrorState message={error} onRetry={loadStories} />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No stories found"
          description={searchTerm ? `No stories matching "${searchTerm}".` : 'No impact stories have been shared yet.'}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((story) => (
            <div key={story.id} className="card card-hover" style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
              {story.image_url && (
                <img
                  src={story.image_url}
                  alt={story.title}
                  style={{
                    width: 'calc(100% + 3rem)',
                    margin: '-1.5rem -1.5rem 1.25rem',
                    height: '12rem',
                    objectFit: 'cover',
                  }}
                  onError={(e) => { e.target.style.display = 'none'; }}
                />
              )}

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', color: 'var(--text-muted)', fontSize: '0.75rem', marginBottom: '0.5rem' }}>
                <Calendar size={13} />
                <span>{new Date(story.created_at).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}</span>
              </div>

              <h3 className="text-xl font-bold text-main" style={{ marginBottom: '0.625rem', lineHeight: '1.3' }}>
                {story.title}
              </h3>

              <p className="text-secondary text-sm leading-relaxed" style={{ flex: 1, whiteSpace: 'pre-line', marginBottom: '1.25rem' }}>
                {story.content}
              </p>

              <div style={{ borderTop: '1px solid var(--border)', paddingTop: '0.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Link
                  to={`/orphanages/${story.orphanage_id}`}
                  className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
                >
                  <Building2 size={13} />
                  View Orphanage
                </Link>
                <Link
                  to="/donate"
                  state={{ orphanageId: story.orphanage_id }}
                  className="btn btn-outline btn-sm"
                >
                  Support Home
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
