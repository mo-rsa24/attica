# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Attica is a full-stack event management and marketplace platform connecting event organizers with vendors, artists, and service providers. It features real-time direct messaging with a bid system.

## Tech Stack

- **Backend**: Django 5.1 + Django REST Framework + Django Channels (WebSockets)
- **Frontend**: React 19 + Vite + Material-UI + TailwindCSS
- **Database**: SQLite (development), Redis for channel layer and caching
- **Auth**: JWT via djangorestframework-simplejwt

## Development Commands

### Backend (Django)
```bash
cd backend/main
source ../venv/bin/activate
python manage.py runserver                    # HTTP only (port 8000)
daphne -b 0.0.0.0 -p 8000 main.asgi:application  # With WebSocket support
python manage.py migrate                      # Run migrations
python manage.py test                         # Run Django tests
pytest                                        # Run pytest suite
```

### Frontend (React/Vite)
```bash
cd frontend
npm install
npm run dev      # Dev server on port 5173
npm run build    # Production build to ./dist
npm run lint     # ESLint
```

### Prerequisites
- Python 3.12 with virtual environment at `backend/venv/`
- Node.js 16+
- Redis server on localhost:6379 (required for WebSockets and caching)

## Architecture

### Backend Structure
Django apps in `backend/main/`:
- **users/** - CustomUser model with roles (organizer, vendor, artist, service_provider), JWT auth
- **events/** - Event and EventDraft models, multi-step event creation
- **vendors/** - Vendor profiles and posts
- **artists/** - Artist profiles and services
- **chat/** - Real-time messaging with WebSocket support, ChatRoom/Message/ChatBid models
- **cart/** - Shopping cart functionality
- **checkout/** - Payments and orders
- **tickets/** - Event ticketing
- **locations/** - Venues and event locations

### Frontend Structure
- `src/AuthProvider.jsx` - JWT token management and refresh logic
- `src/utils/useAxios.js` - Axios instance with JWT interceptor for automatic token refresh
- `src/pages/DirectMessagePage.jsx` - Chat UI with WebSocket integration
- `src/components/chat/` - Chat components

### API Patterns
- REST API at `/api/` - primary persistence layer
- WebSocket at `ws://localhost:8000/ws/chat/rooms/<room_id>/?token=<jwt>`
- Frontend Vite proxy forwards `/api`, `/vendors`, `/cart`, `/checkout` to Django

### Chat System
The chat system uses REST-first architecture where the database is the source of truth. WebSockets provide real-time updates via Redis channel layer. See `Chat.md` for comprehensive documentation on the messaging system including:
- Room creation and discovery
- Message sending/receiving
- Bid management
- File attachments
- WebSocket event types: `message`, `bid`, `read_receipt`, `warning`

### Key Configuration Files
- `backend/main/main/settings.py` - Django settings, CORS, JWT config
- `backend/main/main/asgi.py` - ASGI app with WebSocket routing
- `backend/main/main/routing.py` - WebSocket URL patterns
- `frontend/vite.config.js` - Dev server proxies and HMR config
