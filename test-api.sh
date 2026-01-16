#!/bin/bash
# Knowledge Hub Testing Script

echo "🧪 Knowledge Hub - API Testing Script"
echo "======================================"
echo ""

# Color codes
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

API_URL="http://localhost:5000/api"
USER_EMAIL="test-$(date +%s)@example.com"
USER_PASSWORD="testpass123"
USER_NAME="Test User"

echo -e "${BLUE}Step 1: Register User${NC}"
echo "Email: $USER_EMAIL"
REGISTER_RESPONSE=$(curl -s -X POST $API_URL/auth/register \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$USER_EMAIL\",\"password\":\"$USER_PASSWORD\",\"name\":\"$USER_NAME\"}")

echo "Response: $REGISTER_RESPONSE"
TOKEN=$(echo $REGISTER_RESPONSE | grep -o '"token":"[^"]*' | cut -d'"' -f4)
echo -e "${GREEN}✓ Registered. Token: ${TOKEN:0:20}...${NC}"
echo ""

echo -e "${BLUE}Step 2: Create Article${NC}"
ARTICLE_RESPONSE=$(curl -s -X POST $API_URL/articles \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "AI and Machine Learning",
    "content": "Artificial Intelligence is transforming industries. Machine learning enables computers to learn from data. Deep learning uses neural networks for complex tasks. Natural language processing helps computers understand text.",
    "tags": ["ai", "ml", "tutorial"]
  }')

echo "Response: $ARTICLE_RESPONSE"
ARTICLE_ID=$(echo $ARTICLE_RESPONSE | grep -o '"_id":"[^"]*' | cut -d'"' -f4)
if [ -z "$ARTICLE_ID" ]; then
  ARTICLE_ID=$(echo $ARTICLE_RESPONSE | grep -o '"id":"[^"]*' | cut -d'"' -f4)
fi
echo -e "${GREEN}✓ Article created. ID: $ARTICLE_ID${NC}"
echo ""

echo -e "${BLUE}Step 3: Get Articles${NC}"
GET_RESPONSE=$(curl -s -X GET "$API_URL/articles" \
  -H "Authorization: Bearer $TOKEN")
echo "Response (first 200 chars): ${GET_RESPONSE:0:200}..."
echo -e "${GREEN}✓ Articles retrieved${NC}"
echo ""

echo -e "${BLUE}Step 4: Summarize Article${NC}"
SUMMARIZE_RESPONSE=$(curl -s -X POST "$API_URL/articles/$ARTICLE_ID/summarize" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"provider":"gemini"}')
echo "Response: $SUMMARIZE_RESPONSE"
echo -e "${GREEN}✓ Article summarized${NC}"
echo ""

echo -e "${BLUE}Step 5: Search Articles${NC}"
SEARCH_RESPONSE=$(curl -s -X GET "$API_URL/articles?search=AI" \
  -H "Authorization: Bearer $TOKEN")
echo "Response (first 200 chars): ${SEARCH_RESPONSE:0:200}..."
echo -e "${GREEN}✓ Search executed${NC}"
echo ""

echo -e "${BLUE}Step 6: Edit Article${NC}"
EDIT_RESPONSE=$(curl -s -X PUT "$API_URL/articles/$ARTICLE_ID" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Updated: AI and Machine Learning",
    "content": "Updated content about AI and ML...",
    "tags": ["ai", "ml", "updated"]
  }')
echo "Response (first 200 chars): ${EDIT_RESPONSE:0:200}..."
echo -e "${GREEN}✓ Article updated${NC}"
echo ""

echo "======================================"
echo -e "${GREEN}✅ All tests completed!${NC}"
echo ""
echo "Test User:"
echo "  Email: $USER_EMAIL"
echo "  Password: $USER_PASSWORD"
echo ""
echo "Login to http://localhost:5173 to test the UI"
