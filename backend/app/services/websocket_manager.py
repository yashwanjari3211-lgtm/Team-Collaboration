from fastapi import WebSocket
from typing import Dict, List, Optional
import json

class ConnectionManager:
    def __init__(self):
        # room_id -> list of (websocket, user_info) tuples
        self.active_connections: Dict[str, List[tuple]] = {}

    async def connect(self, websocket: WebSocket, room_id: str, user_info: dict = None):
        await websocket.accept()
        if room_id not in self.active_connections:
            self.active_connections[room_id] = []
        self.active_connections[room_id].append((websocket, user_info or {}))

    def disconnect(self, websocket: WebSocket, room_id: str):
        if room_id in self.active_connections:
            self.active_connections[room_id] = [
                (ws, info) for ws, info in self.active_connections[room_id]
                if ws != websocket
            ]
            if not self.active_connections[room_id]:
                del self.active_connections[room_id]

    def get_user_info(self, websocket: WebSocket, room_id: str) -> Optional[dict]:
        if room_id in self.active_connections:
            for ws, info in self.active_connections[room_id]:
                if ws == websocket:
                    return info
        return None

    def get_room_users(self, room_id: str) -> List[dict]:
        """Get all user infos in a room."""
        if room_id not in self.active_connections:
            return []
        return [info for _, info in self.active_connections[room_id] if info]

    async def broadcast(self, room_id: str, message: dict, exclude: WebSocket = None):
        """Broadcast a message to all connections in a room, optionally excluding one."""
        if room_id in self.active_connections:
            for ws, _ in self.active_connections[room_id]:
                if ws != exclude:
                    try:
                        await ws.send_json(message)
                    except Exception:
                        pass

    async def send_to_user(self, room_id: str, user_id: int, message: dict):
        """Send a message to a specific user in a room."""
        if room_id in self.active_connections:
            for ws, info in self.active_connections[room_id]:
                if info.get('user_id') == user_id:
                    try:
                        await ws.send_json(message)
                    except Exception:
                        pass

    async def send_to_users(self, room_id: str, user_ids: List[int], message: dict):
        """Send a message to specific users in a room."""
        for uid in user_ids:
            await self.send_to_user(room_id, uid, message)

    def get_websocket_for_user(self, room_id: str, user_id: int) -> Optional[WebSocket]:
        """Get WebSocket connection for a specific user in a room."""
        if room_id in self.active_connections:
            for ws, info in self.active_connections[room_id]:
                if info.get('user_id') == user_id:
                    return ws
        return None

manager = ConnectionManager()
