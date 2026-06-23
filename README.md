# Team Collaboration Platform

Full-stack real-time collaboration app with FastAPI + React + PostgreSQL + Redis.

## Setup

### Backend
```bash
cd backend
pip install -r requirements.txt
cp .env.example .env
alembic upgrade head
uvicorn app.main:app --reload
```

### Frontend
```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

### Docker
```bash
docker-compose up --build
```

## Features
- Authentication & JWT
- Organizations & Workspaces
- Real-time messaging (WebSocket)
- Kanban task board
- Channel-based communication
