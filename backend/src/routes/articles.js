const express = require('express');
const Article = require('../models/Article');
const { authenticateToken, authorizeRole } = require('../middleware/auth');
const LLMService = require('../services/llm');
const { getInMemoryDB } = require('../config/database');
const mongoose = require('mongoose');

const router = express.Router();

const useInMemory = () => process.env.MONGODB_URI === 'memory' || !mongoose.connection.readyState;

// POST /api/articles - Create article
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { title, content, tags } = req.body;

    if (!title || !content) {
      return res.status(400).json({ error: 'Title and content are required' });
    }

    if (useInMemory()) {
      const db = getInMemoryDB();
      const newArticle = {
        id: Math.random().toString(36).substr(2, 9),
        title,
        content,
        summary: null,
        tags: tags || [],
        createdBy: req.user.id,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      db.articles.push(newArticle);
      return res.status(201).json(newArticle);
    }

    // MongoDB
    const article = new Article({
      title,
      content,
      tags: tags || [],
      createdBy: req.user.id
    });

    await article.save();
    await article.populate('createdBy', 'email name');

    res.status(201).json(article);
  } catch (error) {
    console.error('Create article error:', error);
    res.status(500).json({ error: 'Failed to create article' });
  }
});

// GET /api/articles - Get all articles
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { search, tag } = req.query;

    if (useInMemory()) {
      const db = getInMemoryDB();
      let articles = [...db.articles];

      if (search) {
        const searchLower = search.toLowerCase();
        articles = articles.filter(a =>
          a.title.toLowerCase().includes(searchLower) ||
          a.content.toLowerCase().includes(searchLower)
        );
      }

      if (tag) {
        articles = articles.filter(a => a.tags.includes(tag));
      }

      return res.json(articles.reverse());
    }

    // MongoDB
    let query = {};

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } }
      ];
    }

    if (tag) {
      query.tags = tag;
    }

    const articles = await Article.find(query)
      .populate('createdBy', 'email name')
      .sort({ createdAt: -1 });

    res.json(articles);
  } catch (error) {
    console.error('Get articles error:', error);
    res.status(500).json({ error: 'Failed to fetch articles' });
  }
});

// GET /api/articles/:id - Get single article
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    if (useInMemory()) {
      const db = getInMemoryDB();
      const article = db.articles.find(a => a.id === id);

      if (!article) {
        return res.status(404).json({ error: 'Article not found' });
      }

      return res.json(article);
    }

    // MongoDB
    const article = await Article.findById(id).populate('createdBy', 'email name');

    if (!article) {
      return res.status(404).json({ error: 'Article not found' });
    }

    res.json(article);
  } catch (error) {
    console.error('Get article error:', error);
    res.status(500).json({ error: 'Failed to fetch article' });
  }
});

// PUT /api/articles/:id - Edit article
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, tags } = req.body;

    if (useInMemory()) {
      const db = getInMemoryDB();
      const article = db.articles.find(a => a.id === id);

      if (!article) {
        return res.status(404).json({ error: 'Article not found' });
      }

      // Check authorization: owner or admin
      if (article.createdBy !== req.user.id && req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Not authorized to edit this article' });
      }

      article.title = title || article.title;
      article.content = content || article.content;
      article.tags = tags || article.tags;
      article.updatedAt = new Date();

      return res.json(article);
    }

    // MongoDB
    const article = await Article.findById(id);

    if (!article) {
      return res.status(404).json({ error: 'Article not found' });
    }

    // Check authorization: owner or admin
    if (article.createdBy.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized to edit this article' });
    }

    article.title = title || article.title;
    article.content = content || article.content;
    article.tags = tags || article.tags;
    article.updatedAt = new Date();

    await article.save();
    await article.populate('createdBy', 'email name');

    res.json(article);
  } catch (error) {
    console.error('Update article error:', error);
    res.status(500).json({ error: 'Failed to update article' });
  }
});

// DELETE /api/articles/:id - Delete article (admin only)
router.delete('/:id', authenticateToken, authorizeRole(['admin']), async (req, res) => {
  try {
    const { id } = req.params;

    if (useInMemory()) {
      const db = getInMemoryDB();
      const index = db.articles.findIndex(a => a.id === id);

      if (index === -1) {
        return res.status(404).json({ error: 'Article not found' });
      }

      const deleted = db.articles.splice(index, 1);
      return res.json({ message: 'Article deleted', article: deleted[0] });
    }

    // MongoDB
    const article = await Article.findByIdAndDelete(id);

    if (!article) {
      return res.status(404).json({ error: 'Article not found' });
    }

    res.json({ message: 'Article deleted', article });
  } catch (error) {
    console.error('Delete article error:', error);
    res.status(500).json({ error: 'Failed to delete article' });
  }
});

// POST /api/articles/:id/summarize - Summarize article
router.post('/:id/summarize', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { provider } = req.body;

    if (useInMemory()) {
      const db = getInMemoryDB();
      const article = db.articles.find(a => a.id === id);

      if (!article) {
        return res.status(404).json({ error: 'Article not found' });
      }

      const summary = await LLMService.summarize(article.content, provider);
      article.summary = summary;
      article.updatedAt = new Date();

      return res.json(article);
    }

    // MongoDB
    const article = await Article.findById(id);

    if (!article) {
      return res.status(404).json({ error: 'Article not found' });
    }

    const summary = await LLMService.summarize(article.content, provider);
    article.summary = summary;
    article.updatedAt = new Date();

    await article.save();
    await article.populate('createdBy', 'email name');

    res.json(article);
  } catch (error) {
    console.error('Summarize error:', error);
    res.status(500).json({ error: 'Failed to summarize article' });
  }
});

// GET /api/articles/:id/users - Get all users (admin only)
router.get('/admin/users', authenticateToken, authorizeRole(['admin']), async (req, res) => {
  try {
    if (useInMemory()) {
      const db = getInMemoryDB();
      const users = db.users.map(u => ({
        id: u.id,
        email: u.email,
        name: u.name,
        role: u.role,
        createdAt: u.createdAt
      }));
      return res.json(users);
    }

    // MongoDB
    const users = await User.find().select('email name role createdAt');
    res.json(users);
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

module.exports = router;
