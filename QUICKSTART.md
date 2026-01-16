# 🚀 Quick Start Guide - Knowledge Hub

## 🎯 Getting Started in 5 Minutes

### Option 1: Local Development (Recommended for Testing)

**Prerequisites:**
- Node.js 18+ installed
- No MongoDB needed (uses in-memory storage by default)

**Step 1: Start Backend**
```bash
cd backend
npm install
npm run dev
```
✅ Backend running on http://localhost:5000

**Step 2: Start Frontend (New Terminal)**
```bash
cd frontend
npm install
npm run dev
```
✅ Frontend running on http://localhost:5173

### Option 2: Docker (All-in-One)

**Prerequisites:**
- Docker & Docker Compose installed

```bash
# Navigate to project root
cd excellence2

# Start everything
docker-compose up -d

# Monitor logs
docker-compose logs -f

# Access:
# - Frontend: http://localhost:3000
# - Backend: http://localhost:5000
# - MongoDB UI: http://localhost:8081
```

✅ All services running!

---

## 🧪 Testing the Application

### 1️⃣ Register a User

**URL:** http://localhost:5173 → "Sign up"

Or via API:
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@test.com",
    "password": "password123",
    "name": "Test User"
  }'
```

### 2️⃣ Login

**URL:** http://localhost:5173 → Enter credentials

Or via API:
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@test.com",
    "password": "password123"
  }'

# Copy the token from response
```

### 3️⃣ Create Article

**UI:** Dashboard → "+ New Article"

Or via API:
```bash
TOKEN="your-jwt-token-from-login"

curl -X POST http://localhost:5000/api/articles \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Getting Started with AI",
    "content": "Artificial Intelligence is transforming the world. Machine learning models can now understand text, images, and more. Large language models like GPT and Gemini are becoming increasingly powerful.",
    "tags": ["ai", "tutorial", "beginner"]
  }'
```

### 4️⃣ Summarize Article

**UI:** Article View → "✨ Summarize with AI"

Or via API:
```bash
TOKEN="your-jwt-token"
ARTICLE_ID="article-id-from-create"

curl -X POST http://localhost:5000/api/articles/$ARTICLE_ID/summarize \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "provider": "gemini"
  }'
```

### 5️⃣ List Articles

**UI:** Dashboard (automatically loads)

Or via API:
```bash
TOKEN="your-jwt-token"

# Get all articles
curl -X GET http://localhost:5000/api/articles \
  -H "Authorization: Bearer $TOKEN"

# Search articles
curl -X GET "http://localhost:5000/api/articles?search=ai" \
  -H "Authorization: Bearer $TOKEN"

# Filter by tag
curl -X GET "http://localhost:5000/api/articles?tag=tutorial" \
  -H "Authorization: Bearer $TOKEN"
```

### 6️⃣ Edit Article

**UI:** Article View → "✏️ Edit"

Or via API:
```bash
TOKEN="your-jwt-token"
ARTICLE_ID="article-id"

curl -X PUT http://localhost:5000/api/articles/$ARTICLE_ID \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Updated Title",
    "content": "Updated content",
    "tags": ["ai", "updated"]
  }'
```

### 7️⃣ Delete Article (Admin Only)

**UI:** Dashboard → "Delete" button (admin users only)

Or via API:
```bash
TOKEN="admin-jwt-token"
ARTICLE_ID="article-id"

curl -X DELETE http://localhost:5000/api/articles/$ARTICLE_ID \
  -H "Authorization: Bearer $TOKEN"
```

---

## 🔧 Admin Testing

### Making a User Admin

**Method 1: MongoDB Directly**
```bash
# Connect to MongoDB
docker exec knowledge-hub-db mongosh -u admin -p password123

# In MongoDB shell
use admin
db.authenticate('admin', 'password123')
use knowledge-hub
db.users.updateOne(
  { email: "user@test.com" },
  { $set: { role: "admin" } }
)
```

**Method 2: Direct Database Edit**
- Access MongoDB UI at http://localhost:8081
- Navigate to knowledge-hub database
- Edit user document and change role to "admin"

### Test Admin Features

1. **Delete Any Article:**
   - Admin can delete articles created by others
   - Users can only delete their own

2. **View All Users:**
   ```bash
   TOKEN="admin-jwt-token"
   curl -X GET http://localhost:5000/api/articles/admin/users \
     -H "Authorization: Bearer $TOKEN"
   ```

---

## 🤖 LLM Configuration

### Using Gemini (Recommended)

1. Get free API key: https://makersuite.google.com/app/apikey
2. Add to `.env`:
   ```env
   LLM_PROVIDER=gemini
   GEMINI_API_KEY=your-api-key-here
   ```
3. Restart backend
4. Summarize articles (no additional setup needed!)

### Using OpenAI

1. Get API key: https://platform.openai.com/api-keys
2. Add to `.env`:
   ```env
   LLM_PROVIDER=openai
   OPENAI_API_KEY=your-api-key-here
   ```
3. Restart backend
4. Summarize articles

### Testing Without API Keys

- Leave API keys empty
- Backend automatically uses **mock summarization**
- Perfect for development/testing

---

## 📊 Database Options

### Default: In-Memory Storage
```env
# Already configured - no setup needed!
MONGODB_URI=memory
```

### Using MongoDB

**Local MongoDB:**
```bash
# Install MongoDB locally and run
mongod

# Set in .env
MONGODB_URI=mongodb://localhost:27017/knowledge-hub
```

**Docker MongoDB (Recommended):**
```bash
# Already in docker-compose.yml
docker-compose up -d mongodb

# Automatically configured
```

**MongoDB UI (for browsing data):**
- URL: http://localhost:8081
- Username: admin
- Password: password123

---

## 🐛 Debugging & Troubleshooting

### Backend Won't Start

```bash
# Check if port 5000 is in use
# Windows
netstat -ano | findstr :5000

# Kill process
taskkill /PID <PID> /F

# Or change port in .env
PORT=5001
```

### Frontend Shows "Cannot reach API"

1. Verify backend is running:
   ```bash
   curl http://localhost:5000/api/health
   ```

2. Check CORS settings in backend `.env`:
   ```env
   CORS_ORIGIN=http://localhost:5173
   ```

3. Restart both frontend and backend

### MongoDB Connection Issues

```bash
# Use in-memory storage instead
MONGODB_URI=memory

# Or check MongoDB is running
docker ps | grep mongodb
```

### Summarize Not Working

1. Check API key is set:
   ```bash
   echo $GEMINI_API_KEY  # Should print your key
   ```

2. Check backend logs:
   ```bash
   docker-compose logs backend
   ```

3. Fall back to mock (for testing):
   ```env
   GEMINI_API_KEY=  # Leave empty
   OPENAI_API_KEY=  # Leave empty
   ```

---

## 📱 Feature Walkthrough

### Authentication Flow
1. **Register** → Create new account
2. **Login** → Get JWT token (stored in localStorage)
3. **Protected Routes** → All endpoints require valid JWT

### Article Workflow
1. **Create** → Write article with title, content, tags
2. **View** → Read article details
3. **Summarize** → Generate AI summary
4. **Edit** → Modify article (if owner or admin)
5. **Delete** → Remove article (admin only)

### Search & Filter
- **Search** → Title and content search
- **Tags** → Click tags to filter articles
- **Real-time** → Results update instantly

---

## 🎨 Frontend Features

**Authentication Pages:**
- Clean login/register forms
- Real-time validation
- Error messages

**Dashboard:**
- Article listing
- Search functionality
- Tag-based filtering
- Admin delete button (conditional)
- Quick article creation

**Article View:**
- Full article display
- AI-generated summary section
- Edit button (for owners/admins)
- Tag display
- Metadata (author, dates)

**Article Editor:**
- Create new articles
- Edit existing articles
- Tag management
- Rich text input

---

## 📦 Production Deployment

### Build Frontend
```bash
cd frontend
npm run build  # Creates dist/ folder
npm run preview  # Preview production build
```

### Production Docker
```bash
# Ensure .env has production values
docker-compose -f docker-compose.yml build
docker-compose -f docker-compose.yml up -d

# Change JWT_SECRET to something strong!
```

### Security Checklist
- [ ] Change `JWT_SECRET` to random string
- [ ] Set strong database passwords
- [ ] Enable HTTPS
- [ ] Configure firewall
- [ ] Set appropriate `CORS_ORIGIN`
- [ ] Store API keys in secrets manager

---

## 📚 API Reference

### Health Check
```
GET /api/health
```

### Authentication
```
POST /api/auth/register
POST /api/auth/login
```

### Articles
```
GET /api/articles
GET /api/articles/:id
POST /api/articles
PUT /api/articles/:id
DELETE /api/articles/:id
POST /api/articles/:id/summarize
```

### Admin
```
GET /api/articles/admin/users
```

---

## ✅ Checklist: Everything Working?

- [ ] Backend starts without errors
- [ ] Frontend loads on http://localhost:5173
- [ ] Can register new user
- [ ] Can login successfully
- [ ] Can create articles
- [ ] Can view article list
- [ ] Can summarize articles
- [ ] Can edit own articles
- [ ] Can search articles
- [ ] Tags filter works

---

## 🆘 Need Help?

1. Check logs:
   ```bash
   docker-compose logs -f  # For Docker
   npm run dev  # For local dev
   ```

2. Test API directly:
   ```bash
   curl -v http://localhost:5000/api/health
   ```

3. Check browser console for errors:
   - Open DevTools (F12)
   - Go to Console tab
   - Look for red error messages

4. Verify all services are running:
   ```bash
   docker-compose ps  # If using Docker
   netstat -tlnp  # Check all ports
   ```

---

**Enjoy your Knowledge Hub! 🎉**
