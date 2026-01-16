# 🔧 Troubleshooting Guide

## Common Issues & Solutions

---

## 🚫 Backend Won't Start

### Error: "Port 5000 already in use"

**Windows:**
```bash
netstat -ano | findstr :5000
# Find the PID from output, then:
taskkill /PID <PID> /F
```

**Linux/Mac:**
```bash
lsof -i :5000
kill -9 <PID>
```

**Or change the port:**
```bash
# In backend/.env
PORT=5001
```

---

### Error: "Cannot find module 'express'"

```bash
cd backend
npm install
npm run dev
```

---

### Error: "Cannot connect to MongoDB"

**Option 1: Use In-Memory Storage (Recommended for Testing)**
```env
MONGODB_URI=memory
```

**Option 2: Start MongoDB Locally**
```bash
# Windows: Download from mongodb.com/try/download
# Mac: brew install mongodb-community && brew services start mongodb-community
# Linux: sudo systemctl start mongod

# Then restart backend
npm run dev
```

**Option 3: Use Docker MongoDB**
```bash
docker-compose up -d mongodb
# Automatically configured in docker-compose.yml
```

---

### Error: "JWT_SECRET not defined"

```env
# Add to backend/.env
JWT_SECRET=your-super-secret-key-here
JWT_EXPIRE=7d
```

---

### Error: Port number must be number, received string

```bash
# Check backend/.env
PORT=5000  # Should be number, not "5000" (no quotes needed in .env)
```

---

## 🎨 Frontend Issues

### Error: "Cannot reach backend API"

**Check backend is running:**
```bash
curl http://localhost:5000/api/health
# Should respond with { "status": "OK" }
```

**Check CORS configuration:**
```env
# In backend/.env
CORS_ORIGIN=http://localhost:5173  # Match your frontend URL
```

**Check frontend API URL:**
```js
// src/api/axiosConfig.js should have correct baseURL
baseURL: 'http://localhost:5000/api'
```

**Restart both servers:**
```bash
# Kill both (Ctrl+C) and restart
cd backend && npm run dev  # Terminal 1
cd frontend && npm run dev # Terminal 2
```

---

### Page shows "Loading..." forever

**Issue:** Token invalid or expired

**Solution:**
1. Clear localStorage: Open DevTools → Application → Storage → Clear All
2. Logout and login again
3. Check backend is running

---

### "Cannot GET /articles" error

**Issue:** You're not authenticated

**Solution:**
1. Go to login page
2. Register or login
3. Then navigate to dashboard

---

### Summarize button does nothing

**Possibility 1: No API key configured**
- Leave API keys empty to use **mock summarization**
- Works without Gemini or OpenAI keys

**Possibility 2: Invalid API key**
- Get key from https://makersuite.google.com/app/apikey
- Add to backend/.env
- Restart backend

**Possibility 3: Network error**
- Check backend logs: `docker-compose logs backend`
- Verify API key has usage quota
- Try with mock mode first

---

### Form submission hangs

**Check:**
1. Backend is running
2. Network tab in DevTools shows request
3. No 500 errors in backend logs

**Solution:**
```bash
# Restart backend
npm run dev
```

---

## 💾 Database Issues

### "Articles not saving"

**Using in-memory storage?**
```env
MONGODB_URI=memory
```
Data is lost on restart - this is expected!

**Switch to MongoDB:**
```bash
docker-compose up -d mongodb
# Set in backend/.env
MONGODB_URI=mongodb://admin:password123@localhost:27017/knowledge-hub?authSource=admin
```

---

### "Cannot authenticate with MongoDB"

```bash
# Check MongoDB is running
docker-compose ps

# If not running
docker-compose up -d mongodb

# Wait a moment for initialization
sleep 10

# Restart backend
npm run dev
```

---

### "Connection timeout"

**Increase timeout in docker-compose.yml:**
```yaml
healthcheck:
  test: echo 'db.runCommand("ping").ok' | mongosh localhost:27017/test --quiet
  interval: 10s
  timeout: 10s  # Increase if needed
  retries: 5
```

---

## 🐳 Docker Issues

### "Cannot connect to Docker daemon"

**Windows:**
- Start Docker Desktop

**Linux:**
```bash
sudo systemctl start docker
```

**Mac:**
- Open Docker.app

---

### "Service 'mongodb' failed to build"

```bash
# Pull latest image
docker pull mongo:6.0

# Rebuild
docker-compose build --no-cache
docker-compose up -d
```

---

### "Port 3000 already in use"

```bash
# Find and kill process
docker ps | grep knowledge
docker kill <container-id>

# Or use different port
docker-compose.yml → change port 3000 to 3001
```

---

### "docker-compose: command not found"

```bash
# Check if installed
docker-compose --version

# Install on Linux
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

---

### Containers keep exiting

```bash
# Check logs
docker-compose logs backend
docker-compose logs frontend
docker-compose logs mongodb

# Look for error messages
```

---

## 🔐 Authentication Issues

### "Invalid email or password"

**Check you're using correct credentials:**
- Email must match exactly (case-insensitive)
- Password must match exactly (case-sensitive)
- No extra spaces

**Try registering new user:**
- If login fails, try registering with different email

---

### "Token expired" error

**JWT tokens expire after 7 days (default)**

```bash
# Change expiration in backend/.env
JWT_EXPIRE=30d  # Or any duration
```

**Solution for users:**
- Logout and login again
- Token will be refreshed

---

### "Access token required"

**Issue:** You're not sending JWT token

**Check:**
1. You're logged in (token in localStorage)
2. API request has Authorization header
3. Token format: `Bearer <token>`

---

## 🤖 LLM/Summarization Issues

### "Summarize not working - API Error"

**Check API key validity:**
```bash
# For Gemini
curl -X GET "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=YOUR_KEY" \
  -H "Content-Type: application/json"

# For OpenAI
curl -X GET "https://api.openai.com/v1/models" \
  -H "Authorization: Bearer YOUR_KEY"
```

---

### "401 Unauthorized from LLM API"

**Issue:** Invalid or expired API key

**Solution:**
1. Get new key from provider
2. Update backend/.env
3. Restart backend
4. Test again

---

### "429 Too Many Requests"

**Issue:** Rate limit exceeded

**Wait a moment and try again**

**Or check your API quota:**
- Gemini: https://makersuite.google.com/app/apikey
- OpenAI: https://platform.openai.com/account/usage/overview

---

### "Summarization returns empty"

**Check article content:**
- Article content must be substantial enough
- Very short articles produce short summaries
- Some special characters may cause issues

**Try mock mode for testing:**
```env
GEMINI_API_KEY=  # Leave empty
LLM_PROVIDER=gemini  # Mock mode activated
```

---

## 🧪 Testing Issues

### test-api.sh: command not found

**Make it executable:**
```bash
chmod +x test-api.sh
./test-api.sh
```

---

### test-api.bat not working (Windows)

**Run from correct directory:**
```bash
cd excellence2
test-api.bat
```

---

### "Cannot parse JSON" error in test

**Check backend is running:**
```bash
curl http://localhost:5000/api/health
```

**If no response, start backend:**
```bash
cd backend
npm run dev
```

---

## 🌐 Network Issues

### "CORS error: Access-Control-Allow-Origin"

**Check backend .env:**
```env
CORS_ORIGIN=http://localhost:5173  # Must match frontend URL
```

**Restart backend:**
```bash
npm run dev
```

---

### "Cannot GET /api/articles" (404)

**Check:**
1. Backend running on correct port
2. Route exists in backend/src/routes/articles.js
3. You're authenticated (have JWT token)
4. API URL is correct in frontend

---

### "Connection refused" when calling API

**Backend not running:**
```bash
cd backend
npm run dev
```

**Wrong port:**
```bash
# Check backend .env
PORT=5000

# Verify with
curl http://localhost:5000/api/health
```

---

## 📊 Performance Issues

### Slow API responses

**Check:**
1. MongoDB is running and responsive
2. No heavy LLM operations in background
3. Check backend logs for errors
4. Reduce article list size (pagination not implemented yet)

---

### Frontend loading slowly

**Solutions:**
```bash
# Clear npm cache
npm cache clean --force

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Check vite build
npm run build
npm run preview
```

---

## 💡 Debugging Tips

### Enable detailed logging

**Backend:**
```js
// src/server.js - add at top
const debug = process.env.DEBUG === 'true';
```

**Run with debug:**
```bash
DEBUG=true npm run dev
```

---

### Check environment variables

**Backend:**
```bash
# Linux/Mac
env | grep -E "(PORT|JWT|MONGODB|LLM)"

# Windows PowerShell
Get-ChildItem env: | Where-Object {$_.Name -match "(PORT|JWT|MONGODB|LLM)"}
```

---

### View backend logs

**Local:**
```bash
# Logs appear in terminal where npm run dev is running
```

**Docker:**
```bash
docker-compose logs -f backend
```

---

### View browser console

**DevTools:**
```
F12 or Ctrl+Shift+I (Windows) / Cmd+Option+I (Mac)
```

**Check for:**
- Red error messages
- CORS errors
- 401/403 authentication errors
- Network request failures

---

### Test API directly

**Using curl:**
```bash
# Check health
curl http://localhost:5000/api/health -v

# Register
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"pass","name":"Test"}' -v

# See verbose output with -v flag
```

---

## 📚 Common Error Messages

### "MongooseError: Cannot connect"
→ MongoDB not running, use `MONGODB_URI=memory` instead

### "JsonWebTokenError: invalid token"
→ Token corrupted or changed, logout and login again

### "EADDRINUSE: address already in use"
→ Port taken by another process, kill it or change port

### "ENOENT: no such file or directory"
→ .env file missing, copy from .env.example

### "TypeError: Cannot read property 'id' of undefined"
→ User object not set after login, try clearing localStorage

### "404 Not Found"
→ Wrong API endpoint, check FEATURES_CHECKLIST.md for correct paths

### "403 Forbidden"
→ Not authorized for this action, only admins can delete articles

### "ECONNREFUSED: Connection refused"
→ Backend not running, start it with `npm run dev`

---

## ✅ Troubleshooting Checklist

When something isn't working:

- [ ] Is backend running? `curl http://localhost:5000/api/health`
- [ ] Is frontend running? Visit http://localhost:5173
- [ ] Are you logged in? Check localStorage
- [ ] Are API keys configured correctly?
- [ ] Is MongoDB running (if not using memory mode)?
- [ ] Check backend logs for errors
- [ ] Check browser console (F12) for errors
- [ ] Restart both frontend and backend
- [ ] Clear browser cache (Ctrl+Shift+Delete)
- [ ] Try with Firefox if Chrome doesn't work
- [ ] Use incognito/private mode to clear cookies
- [ ] Use test scripts to verify API endpoints

---

## 🆘 Still Stuck?

1. **Read the docs:**
   - [README.md](./README.md) - Overview
   - [QUICKSTART.md](./QUICKSTART.md) - Setup guide
   - [SETUP.md](./SETUP.md) - Detailed config

2. **Check the logs:**
   - Terminal where `npm run dev` is running
   - Browser DevTools Console (F12)
   - `docker-compose logs` if using Docker

3. **Try the test scripts:**
   - `./test-api.sh` (Linux/Mac)
   - `test-api.bat` (Windows)

4. **Verify prerequisites:**
   - Node.js 18+ installed
   - npm or yarn available
   - Port 5000 and 5173 available

5. **Look for similar issues:**
   - Search error message in this file
   - Check GitHub issues (if public repo)
   - Search Stack Overflow

---

**Good luck! 🚀**

Most issues are resolved by:
1. Restarting the affected service
2. Clearing browser cache/localStorage
3. Checking .env configuration
4. Looking at backend logs

If you're still stuck after checking all this, the issue is likely configuration-related. Double-check your .env files!
