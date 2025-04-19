# POST a new web message
curl -X POST http://localhost:3000/api/messages \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Message",
    "content": "This is a test message",
    "priority": "high",
    "type": "web",
    "isPublished": true
  }'

# GET web messages
curl http://localhost:3000/api/messages?type=web&limit=50
