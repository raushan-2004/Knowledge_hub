# AI-Powered Knowledge Hub

🚀 A full-stack web application for managing, searching, and summarizing articles using AI.


## Features

✨ **Authentication & Authorization**
- User registration and login with JWT
- Role-based access control (user/admin)
- Secure password hashing with bcrypt

📚 **Article Management**
- Create, read, update, delete articles
- Search articles by title/content
- Filter by tags
- Track article metadata (author, dates)

🤖 **AI Integration**
- Summarize articles using Gemini or OpenAI
- Swappable LLM providers
- Mock summarization for testing (no API key needed)

👥 **Role-Based Features**
- Users: Create and edit their own articles
- Admins: Delete any article, view all users
- Role-aware UI

🐳 **Docker Support**
- Containerized backend, frontend, and MongoDB
- docker-compose for easy deployment
- Environment-based configuration

## Tech Stack

**Backend:**
- Node.js + Express
- MongoDB (with in-memory fallback)
- JWT authentication
- Axios for HTTP requests
- Bcrypt for password hashing

**Frontend:**
- React 18
- Vite (fast build tool)
- React Router for navigation
- Axios for API calls
- CSS Modules for styling

**Deployment:**
- Docker & Docker Compose
- MongoDB
- Nginx (optional)

## Live Demo

🌐 **Try it now:** https://knowledge-hub-omts.vercel.app/login

### Test Users

| Email | Password |
|-------|----------|
| test123@gmail.com | test@123 |
| test456@gmail.com | test@456 |
| admin@knowledgehub.com | admin123456 |

## Quick Start

### Prerequisites
- Node.js 18+
- MongoDB (optional, uses in-memory by default)
- Docker & Docker Compose (for containerized deployment)

### Local Development

```bash
# Clone/setup project
cd excellence2

# Backend
cd backend
npm install
cp .env.example .env
npm run dev  # Runs on http://localhost:5000

# Frontend (in new terminal)
cd frontend
npm install
npm run dev  # Runs on http://localhost:5173
```

### Docker Deployment

```bash
# Create .env with API keys (optional)
cat > .env << EOF
GEMINI_API_KEY=your-gemini-key
OPENAI_API_KEY=your-openai-key
EOF

# Start services
docker-compose up -d

# Access:
# - Frontend: http://localhost:3000
# - Backend: http://localhost:5000
# - MongoDB UI: http://localhost:8081
```

## Configuration

Copy `.env.example` to `.env` and configure:

```env
# Backend
PORT=5000
MONGODB_URI=mongodb://localhost:27017/knowledge-hub
JWT_SECRET=your-secret-key
LLM_PROVIDER=gemini  # or openai
GEMINI_API_KEY=your-key
OPENAI_API_KEY=your-key
```

## API Routes

### Auth
- `POST /api/auth/register` - Register user
- `POST /api/auth/login` - Get JWT token

### Articles
- `GET /api/articles` - List articles
- `POST /api/articles` - Create article
- `GET /api/articles/:id` - Get article
- `PUT /api/articles/:id` - Update (owner/admin)
- `DELETE /api/articles/:id` - Delete (admin)
- `POST /api/articles/:id/summarize` - Summarize with AI

### Admin
- `GET /api/articles/admin/users` - List all users

## Database

### MongoDB Setup (Optional)

```bash
# Using docker-compose (included)
docker-compose up -d mongodb

# Or local MongoDB
mongod
```

### In-Memory Storage (No Setup Required)

Set `MONGODB_URI=memory` in `.env` for development without MongoDB.

## LLM Providers

### Gemini (Google AI)
1. Get key: https://makersuite.google.com/app/apikey
2. Set `LLM_PROVIDER=gemini`

### OpenAI
1. Get key: https://platform.openai.com/api-keys
2. Set `LLM_PROVIDER=openai`

### Mock (Testing)
Leave API keys empty - uses simple text summarization.

## Project Structure

```
excellence2/
├── backend/
│   ├── src/
│   │   ├── server.js           # Express app
│   │   ├── routes/             # API routes
│   │   ├── models/             # MongoDB schemas
│   │   ├── middleware/         # Auth & logging
│   │   ├── services/           # LLM service
│   │   └── config/             # Database config
│   ├── package.json
│   ├── Dockerfile
│   └── .env.example
│
├── frontend/
│   ├── src/
│   │   ├── pages/              # React pages
│   │   ├── context/            # Auth context
│   │   ├── api/                # Axios config
│   │   ├── App.jsx             # Main app
│   │   └── main.jsx            # Entry point
│   ├── index.html
│   ├── vite.config.js
│   ├── package.json
│   ├── Dockerfile
│   └── .gitignore
│
├── docker-compose.yml          # Multi-container setup
├── SETUP.md                    # Detailed setup guide
└── README.md
```

## Development Workflow

1. **Backend Development:**
   ```bash
   cd backend
   npm run dev  # Nodemon auto-reloads on changes
   ```

2. **Frontend Development:**
   ```bash
   cd frontend
   npm run dev  # Vite HMR enabled
   ```

3. **Test Endpoints:**
   ```bash
   # Register
   curl -X POST http://localhost:5000/api/auth/register \
     -H "Content-Type: application/json" \
     -d '{"email":"user@test.com","password":"pass123","name":"Test User"}'

   # Login
   curl -X POST http://localhost:5000/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"user@test.com","password":"pass123"}'
   ```

## Production Deployment

### Using Docker

```bash
# Build production images
docker-compose -f docker-compose.yml build

# Start services
docker-compose -f docker-compose.yml up -d

# Scale backend (if needed)
docker-compose up -d --scale backend=3
```

### Manual Deployment

**Backend:**
```bash
cd backend
npm install --production
NODE_ENV=production npm start
```

**Frontend:**
```bash
cd frontend
npm install
npm run build
# Serve dist/ folder with nginx/apache
```

## Troubleshooting

**Port conflicts:**
```bash
# Change ports in .env or docker-compose.yml
```

**MongoDB errors:**
```bash
# Use in-memory storage
MONGODB_URI=memory
```

**CORS errors:**
```bash
# Update CORS_ORIGIN in backend .env
CORS_ORIGIN=http://your-domain.com
```

**API calls failing:**
```bash
# Check backend is running
curl http://localhost:5000/api/health
```

## Security Considerations

- ✅ JWT with expiration
- ✅ Password hashing with bcrypt
- ✅ Role-based access control
- ✅ CORS configuration
- ⚠️ Change `JWT_SECRET` in production
- ⚠️ Use HTTPS in production
- ⚠️ Store API keys securely (use secrets manager)
- ⚠️ Rate limiting (implement if needed)

## Future Enhancements

- [ ] Email verification
- [ ] Password reset flow
- [ ] Article sharing/collaboration
- [ ] Advanced search (Elasticsearch)
- [ ] Real-time notifications
- [ ] Image upload support
- [ ] Comment system
- [ ] Analytics dashboard
- [ ] API documentation (Swagger)
- [ ] Rate limiting
- [ ] Caching (Redis)

## License

MIT License - Feel free to use for personal or commercial projects.

## Support

Need help? Check [SETUP.md](./SETUP.md) for detailed instructions.
