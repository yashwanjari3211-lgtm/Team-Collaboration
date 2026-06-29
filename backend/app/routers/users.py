import os
import uuid
from fastapi import APIRouter, Depends, UploadFile, File
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.user import UserOut, UserUpdate
from app.models.user import User
from app.utils.dependencies import get_current_user

router = APIRouter()

UPLOAD_DIR = "/app/uploads/avatars"
os.makedirs(UPLOAD_DIR, exist_ok=True)

from fastapi import Request
from app.services.websocket_manager import manager

@router.get("/me", response_model=UserOut)
def get_current_user_info(current_user: User = Depends(get_current_user)):
    return current_user

@router.patch("/me", response_model=UserOut)
async def update_profile(updates: UserUpdate, request: Request, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if updates.full_name is not None:
        current_user.full_name = updates.full_name
    if updates.status is not None:
        current_user.status = updates.status
    db.commit()
    db.refresh(current_user)
    
    # Broadcast user status change to organization
    org_id = request.headers.get("X-Organization-Id")
    if org_id and updates.status is not None:
        await manager.broadcast(f"org_{org_id}", {
            "type": "user_status_updated",
            "user_id": current_user.id,
            "status": current_user.status
        })
        
    return current_user

@router.post("/me/avatar", response_model=UserOut)
async def upload_avatar(file: UploadFile = File(...), current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    # Validate file type
    allowed_types = {"image/jpeg", "image/png", "image/gif", "image/webp"}
    if file.content_type not in allowed_types:
        from fastapi import HTTPException
        raise HTTPException(status_code=400, detail="File must be an image (JPEG, PNG, GIF, or WebP)")
    
    # Generate unique filename
    ext = file.filename.split('.')[-1] if '.' in file.filename else 'png'
    filename = f"{current_user.id}_{uuid.uuid4().hex[:8]}.{ext}"
    filepath = os.path.join(UPLOAD_DIR, filename)
    
    # Save file
    contents = await file.read()
    with open(filepath, "wb") as f:
        f.write(contents)
    
    # Update user avatar URL
    avatar_url = f"/api/users/avatar/{filename}"
    current_user.avatar = avatar_url
    db.commit()
    db.refresh(current_user)
    return current_user

@router.get("/avatar/{filename}")
def get_avatar(filename: str):
    filepath = os.path.join(UPLOAD_DIR, filename)
    if not os.path.exists(filepath):
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Avatar not found")
    return FileResponse(filepath)
