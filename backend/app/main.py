# backend/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import auth, users, channels, messages, tasks, organizations, websocket, invites

app = FastAPI(title="Team Collab API", version="1.0.0")

# Middleware setup from your architecture
# Configured to allow the React frontend to communicate with the backend
origins = [
    "http://localhost:5173", # Standard Vite default port
    "http://localhost:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Root endpoint for health check
@app.get("/")
def read_root():
    return {"status": "healthy", "service": "Backend API is running"}

# Router inclusions based on your diagram
app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(users.router, prefix="/api/users", tags=["Users"])
app.include_router(channels.router, prefix="/api/channels", tags=["Channels"])
app.include_router(messages.router, prefix="/api/messages", tags=["Messages"])
app.include_router(tasks.router, prefix="/api/tasks", tags=["Tasks"])
app.include_router(organizations.router, prefix="/api/organizations", tags=["Organizations"])
app.include_router(invites.router, prefix="/api/invites", tags=["Invites"])

# WebSocket endpoints
app.include_router(websocket.router, prefix="/api/ws", tags=["WebSockets"])