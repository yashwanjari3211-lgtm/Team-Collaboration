from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from app.services.websocket_manager import manager

router = APIRouter()

@router.websocket("/{room_id}")
async def websocket_endpoint(websocket: WebSocket, room_id: str):
    await manager.connect(websocket, room_id)
    try:
        while True:
            data = await websocket.receive_json()
            await manager.broadcast(room_id, data)
    except WebSocketDisconnect:
        manager.disconnect(websocket, room_id)
