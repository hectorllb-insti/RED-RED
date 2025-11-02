# Testing Guide for Backend Fixes

## Pre-requisites

Before testing, ensure you have:
- Python 3.8+ (tested with 3.12.3)
- MongoDB running on localhost:27017 (or configured in .env)
- Redis running on localhost:6379 (optional, for WebSocket features)

## Installation Steps

1. **Create and activate virtual environment**
   ```bash
   cd backend
   python3 -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

2. **Install dependencies**
   ```bash
   pip install --upgrade pip
   pip install -r ../requirements.txt
   ```

   **Note**: If you encounter network timeout issues with pymongo or djongo, try:
   ```bash
   pip install --timeout=300 -r ../requirements.txt
   ```

3. **Configure environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your settings
   ```

## Verification Tests

### 1. Syntax Check (No Dependencies Required)

All Python files have been verified for syntax errors:
```bash
cd backend
find . -name "*.py" -type f -exec python3 -m py_compile {} \;
```
✅ **Status**: PASSED

### 2. Import Verification

Basic non-Django imports work correctly:
```bash
cd backend
python3 -c "from rest_framework import serializers; print('REST Framework OK')"
python3 -c "from channels.generic.websocket import AsyncWebsocketConsumer; print('Channels OK')"
python3 -c "from corsheaders.middleware import CorsMiddleware; print('CORS Headers OK')"
python3 -c "from PIL import Image; print('Pillow OK')"
python3 -c "from decouple import config; print('Python Decouple OK')"
```
✅ **Status**: PASSED

### 3. Django Check (Requires Full Installation)

Once all dependencies are installed:
```bash
cd backend
python manage.py check
```

Expected output:
```
System check identified no issues (0 silenced).
```

### 4. Database Migrations (Requires MongoDB)

```bash
cd backend
python manage.py makemigrations
python manage.py migrate
```

### 5. Admin Interface Test

```bash
cd backend
python manage.py createsuperuser
python manage.py runserver
```

Then visit: http://127.0.0.1:8000/admin/

Verify that all models are registered:
- **Users**: User, Follow
- **Posts**: Post, Like, Comment
- **Stories**: Story, StoryView
- **Messages**: ChatRoom, Message, MessageRead

### 6. API Endpoints Test

Test the following endpoints:

#### Authentication
```bash
# Register
curl -X POST http://127.0.0.1:8000/api/auth/register/ \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","email":"test@example.com","first_name":"Test","last_name":"User","password":"Test123!","password_confirm":"Test123!"}'

# Login
curl -X POST http://127.0.0.1:8000/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test123!"}'
```

#### Users
```bash
# List users (requires authentication token)
curl -X GET http://127.0.0.1:8000/api/users/users/ \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

#### Posts
```bash
# Create post (requires authentication token)
curl -X POST http://127.0.0.1:8000/api/posts/ \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"content":"This is my first post!"}'
```

#### Stories
```bash
# Create story (requires authentication token)
curl -X POST http://127.0.0.1:8000/api/stories/ \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"content":"This is my story!","background_color":"#FF5733"}'
```

#### Messages
```bash
# List chat rooms (requires authentication token)
curl -X GET http://127.0.0.1:8000/api/messages/chats/ \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### 7. WebSocket Test (Requires Redis)

To test WebSocket functionality:

1. Start the server with Daphne:
   ```bash
   cd backend
   daphne -b 127.0.0.1 -p 8000 config.asgi:application
   ```

2. Connect to WebSocket using a client:
   ```javascript
   // In browser console or Node.js
   const ws = new WebSocket('ws://127.0.0.1:8000/ws/chat/ROOM_ID/');
   ws.onmessage = (e) => console.log('Message:', e.data);
   ws.send(JSON.stringify({type: 'message', message: 'Hello!'}));
   ```

## Known Issues and Solutions

### Issue: pip install timeout for pymongo or djongo

**Solution 1**: Increase timeout
```bash
pip install --timeout=600 pymongo==3.12.3
pip install --timeout=600 djongo==1.3.6
```

**Solution 2**: Use wheel files
```bash
pip download pymongo==3.12.3
pip install pymongo-3.12.3-*.whl
```

**Solution 3**: Use a different index
```bash
pip install --index-url https://pypi.org/simple pymongo==3.12.3
```

### Issue: Django apps not loading

**Cause**: Missing djongo installation or MongoDB not running

**Solution**:
1. Ensure djongo and pymongo are installed
2. Start MongoDB service
3. Check .env file has correct DB_HOST

### Issue: "Apps aren't loaded yet" error

**Cause**: Trying to import Django models before Django setup

**Solution**:
```python
import django
import os
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

# Now you can import models
from apps.users.models import User
```

## Success Criteria

Your backend is working correctly if:

- ✅ All Python files compile without syntax errors
- ✅ All dependencies install successfully
- ✅ `python manage.py check` shows no issues
- ✅ Database migrations run successfully
- ✅ Admin interface shows all registered models
- ✅ API endpoints respond correctly
- ✅ WebSocket connections work (if Redis is configured)

## Additional Resources

- Django 4.2 Documentation: https://docs.djangoproject.com/en/4.2/
- Django REST Framework: https://www.django-rest-framework.org/
- Django Channels: https://channels.readthedocs.io/
- djongo Documentation: https://djongomapper.com/

## Troubleshooting

If you encounter any issues:

1. Check the `BACKEND_FIXES.md` file for detailed information about changes
2. Verify Python version: `python --version` (should be 3.8+)
3. Verify Django version: `python -c "import django; print(django.get_version())"` (should be 4.2.11)
4. Check MongoDB is running: `mongosh` or `mongo`
5. Check Redis is running: `redis-cli ping` (should return PONG)
6. Review Django logs for specific error messages

## Contact

If you continue to have issues after following this guide, please:
1. Check existing GitHub issues
2. Create a new issue with:
   - Error message
   - Steps to reproduce
   - Environment details (OS, Python version, etc.)
