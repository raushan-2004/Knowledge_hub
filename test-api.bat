@echo off
REM Knowledge Hub Testing Script for Windows

echo 🧪 Knowledge Hub - API Testing Script
echo ======================================
echo.

set API_URL=http://localhost:5000/api
set USER_EMAIL=test-user@example.com
set USER_PASSWORD=testpass123
set USER_NAME=Test User

echo Step 1: Register User
echo Email: %USER_EMAIL%

curl -X POST %API_URL%/auth/register ^
  -H "Content-Type: application/json" ^
  -d "{\"email\":\"%USER_EMAIL%\",\"password\":\"%USER_PASSWORD%\",\"name\":\"%USER_NAME%\"}"

echo.
echo.
echo Step 2: Login
curl -X POST %API_URL%/auth/login ^
  -H "Content-Type: application/json" ^
  -d "{\"email\":\"%USER_EMAIL%\",\"password\":\"%USER_PASSWORD%\"}"

echo.
echo.
echo Copy the token from above and test article endpoints like:
echo curl -X GET %API_URL%/articles -H "Authorization: Bearer YOUR_TOKEN"
echo.
echo Visit http://localhost:5173 to test the UI
