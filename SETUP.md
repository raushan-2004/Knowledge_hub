# Knowledge Hub - Environment Configuration

## Backend (.env)
```
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/knowledge-hub
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRE=7d
LLM_PROVIDER=gemini
OPENAI_API_KEY=your-openai-key-here
GEMINI_API_KEY=your-gemini-api-key-here
CORS_ORIGIN=http://localhost:5173
```

## Docker Deployment (.env)
For docker-compose, create a `.env` file in the root directory:
```
GEMINI_API_KEY=your-gemini-api-key-here
OPENAI_API_KEY=your-openai-key-here
```

## Setup Instructions

### 1. Local Development

**Backend:**
```bash
cd backend
npm install
npm run dev  # Uses nodemon for auto-reload
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev  # Vite dev server on http://localhost:5173
```

### 2. Docker Deployment

```bash
# Create .env file with API keys
echo "GEMINI_API_KEY=your-key-here" > .env
echo "OPENAI_API_KEY=your-key-here" >> .env

# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### 3. MongoDB Alternative
If you want to use in-memory storage (no MongoDB required):
```
MONGODB_URI=memory
```

### 4. Testing Credentials

For local testing:
- Email: test@example.com
- Password: password123

### 5. Admin Account Setup

Create first user as admin (edit backend code or manually insert to MongoDB):
```javascript
// In MongoDB
db.users.updateOne(
  { email: "admin@example.com" },
  { $set: { role: "admin" } }
)
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register user
- `POST /api/auth/login` - Login and get JWT

### Articles (Authenticated)
- `GET /api/articles` - List all articles (with search/tag filters)
- `POST /api/articles` - Create article
- `GET /api/articles/:id` - Get single article
- `PUT /api/articles/:id` - Edit article (owner/admin)
- `DELETE /api/articles/:id` - Delete article (admin only)
- `POST /api/articles/:id/summarize` - Summarize with LLM

### Admin
- `GET /api/articles/admin/users` - View all users (admin only)

## LLM Configuration

### Gemini (Google AI)
1. Get API key: https://makersuite.google.com/app/apikey
2. Set `LLM_PROVIDER=gemini`
3. Add `GEMINI_API_KEY` to .env

### OpenAI
1. Get API key: https://platform.openai.com/api-keys
2. Set `LLM_PROVIDER=openai`
3. Add `OPENAI_API_KEY` to .env

### Mock (Development)
- No API key needed
- Set `LLM_PROVIDER=mock` or leave API keys empty

## Troubleshooting

**Port already in use:**
```bash
# Find and kill process
lsof -i :5000  # Linux/Mac
netstat -ano | findstr :5000  # Windows

# Or use different ports in .env
```

**MongoDB connection failed:**
- Check MongoDB is running
- Or set `MONGODB_URI=memory` for in-memory storage

**Frontend can't reach backend:**
- Check CORS_ORIGIN in backend .env
- Verify both servers are running
- Check browser console for CORS errors
