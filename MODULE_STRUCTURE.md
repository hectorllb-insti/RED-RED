# Backend Module Structure

## Overview

This document provides a comprehensive overview of the backend module structure, imports, and dependencies for the RED-RED social network application.

## Directory Structure

```
backend/
├── apps/                           # Django applications
│   ├── __init__.py
│   ├── authentication/             # User authentication
│   │   ├── __init__.py
│   │   ├── apps.py                # App configuration
│   │   ├── serializers.py         # JWT and registration serializers
│   │   ├── urls.py                # Authentication endpoints
│   │   └── views.py               # Register and token views
│   │
│   ├── users/                      # User profiles and relationships
│   │   ├── __init__.py
│   │   ├── admin.py               # Admin interface for User and Follow
│   │   ├── apps.py                # App configuration
│   │   ├── models.py              # User and Follow models
│   │   ├── serializers.py         # User serializers
│   │   ├── urls.py                # User endpoints
│   │   └── views.py               # User CRUD and follow operations
│   │
│   ├── posts/                      # Social posts functionality
│   │   ├── __init__.py
│   │   ├── admin.py               # Admin interface for Post, Like, Comment
│   │   ├── apps.py                # App configuration
│   │   ├── models.py              # Post, Like, and Comment models
│   │   ├── serializers.py         # Post serializers
│   │   ├── urls.py                # Post endpoints
│   │   └── views.py               # Post CRUD, like, and comment operations
│   │
│   ├── stories/                    # 24-hour stories feature
│   │   ├── __init__.py
│   │   ├── admin.py               # Admin interface for Story and StoryView
│   │   ├── apps.py                # App configuration
│   │   ├── models.py              # Story and StoryView models
│   │   ├── serializers.py         # Story serializers
│   │   ├── urls.py                # Story endpoints
│   │   └── views.py               # Story CRUD and view tracking
│   │
│   └── messages/                   # Real-time messaging
│       ├── __init__.py
│       ├── admin.py               # Admin interface for ChatRoom, Message, MessageRead
│       ├── apps.py                # App configuration
│       ├── consumers.py           # WebSocket consumers for real-time chat
│       ├── models.py              # ChatRoom, Message, and MessageRead models
│       ├── routing.py             # WebSocket URL routing
│       ├── serializers.py         # Message serializers
│       ├── urls.py                # Message HTTP endpoints
│       └── views.py               # Chat room and message operations
│
├── config/                         # Django project configuration
│   ├── __init__.py
│   ├── asgi.py                    # ASGI configuration for WebSockets
│   ├── settings.py                # Project settings
│   ├── urls.py                    # Main URL configuration
│   └── wsgi.py                    # WSGI configuration for HTTP
│
├── .env.example                    # Environment variables template
└── manage.py                       # Django management script
```

## Module Dependencies

### Authentication App

**Dependencies:**
- `rest_framework` - For API views and serializers
- `rest_framework_simplejwt` - For JWT token generation
- `django.contrib.auth` - For user model and password validation

**Purpose:** Handles user registration and authentication using JWT tokens.

**Key Components:**
- `RegisterSerializer` - Validates and creates new user accounts
- `CustomTokenObtainPairSerializer` - Customizes JWT token payload
- `RegisterView` - Creates new user accounts
- `CustomTokenObtainPairView` - Generates JWT tokens for login

### Users App

**Dependencies:**
- `django.contrib.auth.models.AbstractUser` - Base user model
- `rest_framework` - For API views and serializers

**Purpose:** Manages user profiles, relationships, and social connections.

**Models:**
- `User` (extends AbstractUser) - User profile with social features
  - Fields: email, bio, profile_picture, cover_picture, location, website, is_private
  - Methods: get_followers_count(), get_following_count()
- `Follow` - Follower/following relationships
  - Fields: follower, following, created_at
  - Unique constraint: (follower, following)

**Key Features:**
- User profile management
- Follow/unfollow functionality
- Follower and following lists
- Profile privacy settings

### Posts App

**Dependencies:**
- `django.contrib.auth.get_user_model()` - For user references
- `apps.users.models.Follow` - To filter posts by followed users

**Purpose:** Handles social media posts with likes and comments.

**Models:**
- `Post` - User posts
  - Fields: author, content, image, created_at, updated_at
  - Methods: get_likes_count(), get_comments_count()
- `Like` - Post likes
  - Fields: user, post, created_at
  - Unique constraint: (user, post)
- `Comment` - Post comments
  - Fields: author, post, content, created_at, updated_at

**Key Features:**
- Create, read, update, delete posts
- Like/unlike posts
- Comment on posts
- Feed shows posts from followed users

### Stories App

**Dependencies:**
- `django.contrib.auth.get_user_model()` - For user references
- `django.utils.timezone` - For expiration handling
- `apps.users.models.Follow` - To filter stories by followed users

**Purpose:** Implements Instagram-style 24-hour stories.

**Models:**
- `Story` - User stories
  - Fields: author, content, image, video, background_color, created_at, expires_at
  - Properties: is_expired
  - Methods: get_views_count()
  - Auto-expiration: 24 hours from creation
- `StoryView` - Story view tracking
  - Fields: user, story, viewed_at
  - Unique constraint: (user, story)

**Key Features:**
- Create stories with text, images, or videos
- Stories auto-expire after 24 hours
- View tracking (who viewed each story)
- Feed shows stories from followed users

### Messages App

**Dependencies:**
- `channels` - For WebSocket support
- `channels_redis` - For channel layer backend
- `django.contrib.auth.get_user_model()` - For user references

**Purpose:** Real-time chat functionality with private and group messaging.

**Models:**
- `ChatRoom` - Chat room container
  - Fields: participants (ManyToMany), created_at, updated_at
  - Property: room_name
- `Message` - Individual messages
  - Fields: chat_room, sender, content, image, is_read, created_at, updated_at
- `MessageRead` - Read receipts
  - Fields: message, user, read_at
  - Unique constraint: (message, user)

**Key Features:**
- Private one-on-one chats
- Group messaging support
- Real-time message delivery via WebSockets
- Read receipts
- Typing indicators
- Message history

**WebSocket Consumer:**
- `ChatConsumer` - Handles WebSocket connections
  - Methods: connect(), disconnect(), receive()
  - Message types: message, typing
  - Real-time message broadcasting

## Import Dependencies

### Cross-App Imports

The following cross-app imports exist and are properly structured:

1. **posts → users**
   ```python
   from apps.users.models import Follow
   ```
   Used to filter posts by followed users.

2. **stories → users**
   ```python
   from apps.users.models import Follow
   ```
   Used to filter stories by followed users.

These imports are safe and do not create circular dependencies.

### External Dependencies

All apps depend on:
- `django` - Core Django framework (4.2.11 LTS)
- `rest_framework` - Django REST Framework (3.14.0)
- `rest_framework_simplejwt` - JWT authentication (5.3.0)

Additional dependencies:
- `channels` - WebSocket support (4.0.0)
- `channels-redis` - Redis channel layer (4.2.0)
- `redis` - Redis client (5.0.1)
- `corsheaders` - CORS headers (4.3.1)
- `djongo` - MongoDB backend (1.3.6)
- `pymongo` - MongoDB driver (3.12.3)
- `Pillow` - Image processing (10.2.0)
- `python-decouple` - Environment variables (3.8)
- `daphne` - ASGI server (4.0.0)

## Configuration

### Settings Modules

**INSTALLED_APPS:**
```python
DJANGO_APPS = [
    'daphne',                          # ASGI server (must be first)
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
]

THIRD_PARTY_APPS = [
    'rest_framework',                  # REST API framework
    'rest_framework_simplejwt',        # JWT authentication
    'corsheaders',                     # CORS headers
    'channels',                        # WebSocket support
]

LOCAL_APPS = [
    'apps.authentication',             # User authentication
    'apps.users',                      # User profiles
    'apps.posts',                      # Social posts
    'apps.stories',                    # 24-hour stories
    'apps.messages',                   # Real-time messaging
]
```

**MIDDLEWARE:**
```python
MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',  # CORS (must be first)
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]
```

### URL Configuration

**Main URLs (config/urls.py):**
```python
urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/', include('apps.authentication.urls')),
    path('api/users/', include('apps.users.urls')),
    path('api/posts/', include('apps.posts.urls')),
    path('api/stories/', include('apps.stories.urls')),
    path('api/messages/', include('apps.messages.urls')),
]
```

### ASGI Configuration

**WebSocket Routing (config/asgi.py):**
```python
application = ProtocolTypeRouter({
    "http": get_asgi_application(),
    "websocket": AuthMiddlewareStack(
        URLRouter(
            apps.messages.routing.websocket_urlpatterns
        )
    ),
})
```

## Database Schema

### User Model (Custom)
- Extends `AbstractUser`
- Custom fields for social features
- Profile pictures and cover images
- Privacy settings

### Relationships
- User ←→ Follow (follower/following)
- User → Post (author)
- User → Like (user likes)
- User → Comment (author)
- User → Story (author)
- User → StoryView (viewer)
- User → ChatRoom (participants, many-to-many)
- User → Message (sender)
- User → MessageRead (reader)

## API Endpoints

### Authentication
- `POST /api/auth/register/` - Register new user
- `POST /api/auth/login/` - Login and get JWT tokens
- `POST /api/auth/token/refresh/` - Refresh access token

### Users
- `GET /api/users/profile/` - Get current user profile
- `PUT /api/users/profile/` - Update current user profile
- `GET /api/users/users/` - List all users
- `GET /api/users/users/<username>/` - Get specific user
- `POST /api/users/follow/<username>/` - Follow user
- `DELETE /api/users/unfollow/<username>/` - Unfollow user
- `GET /api/users/<username>/followers/` - Get user's followers
- `GET /api/users/<username>/following/` - Get user's following

### Posts
- `GET /api/posts/` - List posts (feed)
- `POST /api/posts/` - Create new post
- `GET /api/posts/<id>/` - Get specific post
- `PUT /api/posts/<id>/` - Update post
- `DELETE /api/posts/<id>/` - Delete post
- `GET /api/posts/user/<username>/` - Get user's posts
- `POST /api/posts/<id>/like/` - Like/unlike post
- `POST /api/posts/<id>/comment/` - Comment on post
- `GET /api/posts/<id>/comments/` - Get post comments

### Stories
- `GET /api/stories/` - List active stories (feed)
- `POST /api/stories/` - Create new story
- `GET /api/stories/user/<username>/` - Get user's stories
- `POST /api/stories/<id>/view/` - Mark story as viewed
- `GET /api/stories/<id>/viewers/` - Get story viewers (author only)

### Messages
- `GET /api/messages/chats/` - List chat rooms
- `POST /api/messages/chats/` - Create chat room
- `GET /api/messages/chats/<id>/` - Get chat room details
- `GET /api/messages/chats/<id>/messages/` - Get chat messages
- `POST /api/messages/chats/<id>/read/` - Mark messages as read
- `POST /api/messages/chat/create/<username>/` - Create private chat

### WebSockets
- `ws://host/ws/chat/<room_name>/` - Connect to chat room

## Module Testing

Each module can be tested independently:

1. **Unit Tests**: Test models, serializers, and views
2. **Integration Tests**: Test API endpoints
3. **WebSocket Tests**: Test real-time messaging

See `TESTING_GUIDE.md` for detailed testing instructions.

## Module Maintenance

### Adding New Apps

1. Create app structure:
   ```bash
   cd backend/apps
   python ../manage.py startapp newapp
   ```

2. Add to `INSTALLED_APPS` in settings.py
3. Create models, views, serializers, urls
4. Create admin.py for model registration
5. Include URLs in main config/urls.py

### Modifying Existing Apps

1. Update models (create migrations)
2. Update serializers
3. Update views
4. Update admin interface
5. Update tests
6. Document changes

## Security Considerations

- JWT tokens for authentication
- CSRF protection enabled
- CORS configured for frontend
- User privacy settings
- Read receipts for messages
- Profile visibility controls

## Performance Considerations

- Database indexes on foreign keys
- Pagination on list endpoints (20 items per page)
- Story auto-expiration via database
- Redis for channel layer (WebSocket performance)
- Image optimization with Pillow

## Future Improvements

Potential enhancements:
1. Migrate to PostgreSQL for better Django ORM support
2. Add full-text search for posts and users
3. Implement caching with Redis
4. Add push notifications
5. Implement media compression
6. Add content moderation
7. Implement rate limiting
8. Add activity logging
9. Implement data analytics
10. Add email notifications

---

For more information, see:
- `BACKEND_FIXES.md` - Details on fixes applied
- `TESTING_GUIDE.md` - Testing procedures
- `README.md` - General project information
