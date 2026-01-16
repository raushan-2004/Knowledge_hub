import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axiosConfig';
import { useAuth } from '../context/AuthContext';
import { downloadArticleAsPDF } from '../utils/pdfDownload';
import styles from './ArticleView.module.css';

export const ArticleView = () => {
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [summarizing, setSummarizing] = useState(false);
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    fetchArticle();
  }, [id]);

  const fetchArticle = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/articles/${id}`);
      setArticle(response.data);
      setError('');
    } catch (err) {
      setError('Failed to load article');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSummarize = async () => {
    try {
      setSummarizing(true);
      const response = await api.post(`/articles/${id}/summarize`);
      setArticle(response.data);
    } catch (err) {
      setError('Failed to summarize article');
    } finally {
      setSummarizing(false);
    }
  };

  const canEdit = user && (article?.createdBy?._id === user.id || user.role === 'admin');

  if (loading) {
    return (
      <div className="container" style={{ padding: '40px 20px', textAlign: 'center', color: 'white' }}>
        <span className="spinner"></span> Loading article...
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="container" style={{ padding: '40px 20px' }}>
        <div className="error">{error || 'Article not found'}</div>
        <button className="btn-primary" onClick={() => navigate('/')}>Back to Dashboard</button>
      </div>
    );
  }

  return (
    <div className={styles.articleView}>
      <div className="container">
        <button className="btn-secondary" onClick={() => navigate('/')}>← Back to Dashboard</button>

        <article className="card" style={{ marginTop: '20px' }}>
          <h1 className={styles.title}>{article.title}</h1>

          <div className={styles.meta}>
            <span>By <strong>{article.createdBy?.name || 'Unknown'}</strong></span>
            <span>•</span>
            <span>{new Date(article.createdAt).toLocaleDateString()}</span>
            {article.updatedAt !== article.createdAt && (
              <>
                <span>•</span>
                <span>Updated {new Date(article.updatedAt).toLocaleDateString()}</span>
              </>
            )}
          </div>

          {article.tags && article.tags.length > 0 && (
            <div className={styles.tags}>
              {article.tags.map((tag, idx) => (
                <span key={idx} className={styles.tag}>#{tag}</span>
              ))}
            </div>
          )}

          <div className={styles.actions}>
            <button
              className="btn-primary"
              onClick={handleSummarize}
              disabled={summarizing}
            >
              {summarizing ? (
                <>
                  <span className="spinner"></span> Summarizing...
                </>
              ) : (
                '✨ Summarize with AI'
              )}
            </button>

            <button
              className="btn-secondary"
              onClick={() => downloadArticleAsPDF(article)}
              title="Download article as PDF"
            >
              📥 Download PDF
            </button>

            {canEdit && (
              <button
                className="btn-secondary"
                onClick={() => navigate(`/articles/${id}/edit`)}
              >
                ✏️ Edit
              </button>
            )}
          </div>

          {article.summary && (
            <div className={styles.summary}>
              <h3>AI Summary</h3>
              <p>{article.summary}</p>
            </div>
          )}

          <div className={styles.content}>
            {article.content}
          </div>
        </article>
      </div>
    </div>
  );
};

export const ArticleEdit = () => {
  const [formData, setFormData] = useState({ title: '', content: '', tags: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const { id } = useParams();
  const navigate = useNavigate();
  const isNewArticle = !id;

  useEffect(() => {
    if (!isNewArticle) {
      fetchArticle();
    } else {
      setLoading(false);
    }
  }, [id]);

  const fetchArticle = async () => {
    try {
      const response = await api.get(`/articles/${id}`);
      setFormData({
        title: response.data.title,
        content: response.data.content,
        tags: response.data.tags?.join(', ') || ''
      });
      setError('');
    } catch (err) {
      setError('Failed to load article');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.content) {
      setError('Title and content are required');
      return;
    }

    try {
      setSaving(true);
      const payload = {
        ...formData,
        tags: formData.tags.split(',').map(t => t.trim()).filter(t => t)
      };

      if (isNewArticle) {
        await api.post('/articles', payload);
        navigate('/');
      } else {
        await api.put(`/articles/${id}`, payload);
        navigate(`/articles/${id}`);
      }
    } catch (err) {
      setError('Failed to save article');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="container" style={{ padding: '40px 20px', textAlign: 'center', color: 'white' }}>
        <span className="spinner"></span> Loading...
      </div>
    );
  }

  return (
    <div className={styles.articleView}>
      <div className="container">
        <button className="btn-secondary" onClick={() => navigate(isNewArticle ? '/' : `/articles/${id}`)}>
          ← Back
        </button>

        <form className="card" onSubmit={handleSubmit} style={{ marginTop: '20px' }}>
          <h1>{isNewArticle ? 'Create Article' : 'Edit Article'}</h1>

          {error && <div className="error">{error}</div>}

          <div className={styles.formGroup}>
            <label>Title</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
              placeholder="Article title"
            />
          </div>

          <div className={styles.formGroup}>
            <label>Content</label>
            <textarea
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              required
              placeholder="Write your article content here..."
              rows="12"
            />
          </div>

          <div className={styles.formGroup}>
            <label>Tags (comma-separated)</label>
            <input
              type="text"
              value={formData.tags}
              onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
              placeholder="javascript, ai, tutorial"
            />
          </div>

          <button type="submit" className="btn-primary" disabled={saving}>
            {saving ? <span className="spinner"></span> : ''} {isNewArticle ? 'Create' : 'Update'} Article
          </button>
        </form>
      </div>
    </div>
  );
};
