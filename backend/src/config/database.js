const mongoose = require('mongoose');

// In-memory fallback store for when MongoDB is not available
let inMemoryDB = {
  users: [],
  articles: []
};

const connectDB = async () => {
  if (process.env.MONGODB_URI === 'memory') {
    console.log('📦 Using in-memory database');
    return;
  }

  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/knowledge-hub', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.warn('⚠️ MongoDB connection failed, falling back to in-memory storage:', error.message);
    process.env.MONGODB_URI = 'memory';
  }
};

const getInMemoryDB = () => inMemoryDB;

module.exports = {
  connectDB,
  getInMemoryDB,
  inMemoryDB
};
