from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from app.services.websocket_manager import manager
import json

router = APIRouter()

@router.websocket("/{room_id}")
async def websocket_endpoint(websocket: WebSocket, room_id: str):
    # Extract user info from query params
    user_id = websocket.query_params.get("user_id")
    user_name = websocket.query_params.get("user_name", "Unknown")

    user_info = {
        "user_id": int(user_id) if user_id else None,
        "user_name": user_name,
    }

    await manager.connect(websocket, room_id, user_info)

    try:
        while True:
            data = await websocket.receive_json()
            msg_type = data.get("type", "message")

            if msg_type == "message":
                # Regular chat message — broadcast to room
                await manager.broadcast(room_id, data)

            elif msg_type == "call_initiate":
                # User wants to start a call; send ring to selected users
                target_user_ids = data.get("target_user_ids", [])
                call_data = {
                    "type": "incoming_call",
                    "caller_id": user_info.get("user_id"),
                    "caller_name": user_info.get("user_name"),
                    "call_type": data.get("call_type", "audio"),  # audio | video
                    "room_id": room_id,
                    "call_id": data.get("call_id"),
                }
                if target_user_ids:
                    await manager.send_to_users_global(target_user_ids, call_data)
                else:
                    # Broadcast to everyone in room except caller
                    await manager.broadcast(room_id, call_data, exclude=websocket)

            elif msg_type == "call_accept":
                # User accepted the call — notify the caller
                caller_id = data.get("caller_id")
                if caller_id:
                    await manager.send_to_user_global(int(caller_id), {
                        "type": "call_accepted",
                        "accepter_id": user_info.get("user_id"),
                        "accepter_name": user_info.get("user_name"),
                        "call_id": data.get("call_id"),
                    })

            elif msg_type == "call_reject":
                # User rejected the call — notify the caller
                caller_id = data.get("caller_id")
                if caller_id:
                    await manager.send_to_user_global(int(caller_id), {
                        "type": "call_rejected",
                        "rejecter_id": user_info.get("user_id"),
                        "rejecter_name": user_info.get("user_name"),
                        "call_id": data.get("call_id"),
                    })

            elif msg_type == "call_end":
                # Call ended — notify all in room
                await manager.broadcast(room_id, {
                    "type": "call_ended",
                    "ended_by": user_info.get("user_id"),
                    "call_id": data.get("call_id"),
                }, exclude=websocket)

            elif msg_type in ("webrtc_offer", "webrtc_answer", "ice_candidate"):
                # WebRTC signaling — forward to target user globally
                target_id = data.get("target_user_id")
                if target_id:
                    forward_data = {**data, "from_user_id": user_info.get("user_id"), "from_user_name": user_info.get("user_name")}
                    await manager.send_to_user_global(int(target_id), forward_data)

            elif msg_type == "screen_share_start":
                await manager.broadcast(room_id, {
                    "type": "screen_share_start",
                    "user_id": user_info.get("user_id"),
                    "user_name": user_info.get("user_name"),
                    "call_id": data.get("call_id"),
                }, exclude=websocket)

            elif msg_type == "screen_share_stop":
                await manager.broadcast(room_id, {
                    "type": "screen_share_stop",
                    "user_id": user_info.get("user_id"),
                    "call_id": data.get("call_id"),
                }, exclude=websocket)

            else:
                # Unknown type — broadcast to all
                await manager.broadcast(room_id, data)

    except WebSocketDisconnect:
        manager.disconnect(websocket, room_id)
        # Notify others the user left
        await manager.broadcast(room_id, {
            "type": "user_left",
            "user_id": user_info.get("user_id"),
            "user_name": user_info.get("user_name"),
        })
