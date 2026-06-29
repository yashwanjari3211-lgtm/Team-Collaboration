import os
import time
from fastapi import APIRouter, Depends, HTTPException, Query
from app.models.user import User
from app.utils.dependencies import get_current_user

# Try to import the token builder. If not installed (e.g. locally before rebuild), mock it.
try:
    from agora_token_builder import RtcTokenBuilder
except ImportError:
    RtcTokenBuilder = None

router = APIRouter()

# Note: In production, these should be securely injected via environment variables.
# Using dummy defaults for prototype purposes if env vars are missing.
AGORA_APP_ID = os.getenv("AGORA_APP_ID")
AGORA_APP_CERTIFICATE = os.getenv("AGORA_APP_CERTIFICATE")

@router.get("/token")
def get_agora_token(
    channelName: str = Query(..., description="The name of the Agora channel"),
    current_user: User = Depends(get_current_user)
):
    """
    Generate an Agora RTC token for the current user to join a channel.
    """
    if not RtcTokenBuilder:
        # Fallback or error if module is missing
        raise HTTPException(
            status_code=500, 
            detail="agora-token-builder is not installed on the server."
        )

    if not AGORA_APP_ID or not AGORA_APP_CERTIFICATE:
        raise HTTPException(
            status_code=500,
            detail="Agora App ID and Certificate are not configured."
        )

    # Use the user's ID as their Agora UID. 
    # Agora UID must be a 32-bit unsigned integer.
    uid = current_user.id
    
    # Token valid for 24 hours
    expiration_time_in_seconds = 3600 * 24
    current_timestamp = int(time.time())
    privilege_expired_ts = current_timestamp + expiration_time_in_seconds

    # 1: Role_Publisher (can publish and subscribe), 2: Role_Subscriber (can only subscribe)
    role = 1 

    token = RtcTokenBuilder.buildTokenWithUid(
        AGORA_APP_ID, 
        AGORA_APP_CERTIFICATE, 
        channelName, 
        uid, 
        role, 
        privilege_expired_ts
    )

    return {
        "token": token,
        "appId": AGORA_APP_ID,
        "uid": uid
    }
