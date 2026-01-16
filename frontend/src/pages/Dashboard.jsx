import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axiosConfig';
import { useAuth } from '../context/AuthContext';
import { ThemeSwitcher } from '../components/ThemeSwitcher';
import styles from './Dashboard.module.css';

export const Dashboard = () => {
  const [articles, setArticles] = useState([]);
  const [search, setSearch] = useState('');
  const [tag, setTag] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user, logout, token, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Only fetch articles if user is authenticated
    if (!authLoading && token) {
      fetchArticles();
    } else if (!authLoading && !token) {
      setError('Not authenticated. Please login.');
      setLoading(false);
    }
  }, [authLoading, token]);

  const fetchArticles = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (tag) params.append('tag', tag);

      const response = await api.get(`/articles?${params}`);
      setArticles(response.data);
      setError('');
    } catch (err) {
      const errorMsg = err.response?.data?.error || err.message || 'Failed to load articles';
      const statusCode = err.response?.status;
      
      if (statusCode === 401 || statusCode === 403) {
        setError(`Authentication failed (${statusCode}). Please login again.`);
        logout();
        navigate('/login');
      } else {
        setError(errorMsg);
      }
      
      console.error('Fetch articles error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this article?')) return;

    try {
      await api.delete(`/articles/${id}`);
      setArticles(articles.filter(a => a._id !== id && a.id !== id));
    } catch (err) {
      setError('Failed to delete article');
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchArticles();
  };

  const handleTagClick = (selectedTag) => {
    setTag(selectedTag === tag ? '' : selectedTag);
  };

  return (
    <div className={styles.dashboard}>
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <h1>📚 Knowledge Hub</h1>
          <div className={styles.userMenu}>
            <ThemeSwitcher />
            <span className={styles.userInfo}>
              {user?.name} {user?.role === 'admin' && <span className={styles.adminBadge}>Admin</span>}
            </span>
            <button className="btn-secondary" onClick={logout}>Logout</button>
          </div>
        </div>
      </header>

      <main className="container">
        <section className={styles.controls}>
          <div className={styles.searchBar}>
            <form onSubmit={handleSearch}>
              <input
                type="text"
                placeholder="Search articles..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <button type="submit" className="btn-primary">Search</button>
            </form>
          </div>
          <button
            className="btn-primary"
            onClick={() => navigate('/articles/new')}
          >
            + New Article
          </button>
        </section>

        {error && <div className="error">{error}</div>}

        {loading ? (
          <div className={styles.loading}>
            <span className="spinner"></span> Loading articles...
          </div>
        ) : (
          <>
            {articles.length === 0 ? (
              <div className={styles.empty}>
                <p>No articles found. Create your first one!</p>
                <button className="btn-primary" onClick={() => navigate('/articles/new')}>
                  Create Article
                </button>
              </div>
            ) : (
              <div className={styles.articlesList}>
                {articles.map((article) => (
                  <div key={article._id || article.id} className="card">
                    <div className={styles.articleHeader}>
                      <h2
                        className={styles.articleTitle}
                        onClick={() => navigate(`/articles/${article._id || article.id}`)}
                      >
                        {article.title}
                      </h2>
                      <div className={styles.articleActions}>
                        <button
                          className="btn-primary"
                          onClick={() => navigate(`/articles/${article._id || article.id}`)}
                        >
                          View
                        </button>
                        {user?.role === 'admin' && (
                          <button
                            className="btn-danger"
                            onClick={() => handleDelete(article._id || article.id)}
                          >
                            Delete
                          </button>
                        )}
                      </div>
                    </div>

                    {article.summary && (
                      <p className={styles.summary}>
                        <strong>Summary:</strong> {article.summary}
                      </p>
                    )}

                    {article.tags && article.tags.length > 0 && (
                      <div className={styles.tags}>
                        {article.tags.map((t, idx) => (
                          <button
                            key={idx}
                            className={styles.tag}
                            onClick={() => handleTagClick(t)}
                          >
                            #{t}
                          </button>
                        ))}
                      </div>
                    )}

                    <p className={styles.meta}>
                      By {article.createdBy?.name || 'Unknown'} • {new Date(article.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
};
