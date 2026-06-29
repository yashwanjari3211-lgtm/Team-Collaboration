from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.message import MessageCreate, MessageOut
from app.models.message import Message
from app.models.user import User
from app.models.organization import Organization
from app.utils.dependencies import get_current_user, get_current_organization

router = APIRouter()

from app.services.websocket_manager import manager
from fastapi.encoders import jsonable_encoder

@router.post("/", response_model=MessageOut)
async def send_message(msg: MessageCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user), org: Organization = Depends(get_current_organization)):
    db_msg = Message(content=msg.content, channel_id=msg.channel_id, user_id=current_user.id, organization_id=org.id)
    db.add(db_msg)
    db.commit()
    db.refresh(db_msg)
    
    # Broadcast message via WebSocket to the entire organization
    message_data = jsonable_encoder(db_msg)
    message_data["type"] = "message"
    message_data["user"] = jsonable_encoder(current_user)
    
    await manager.broadcast(f"org_{org.id}", message_data)
    
    return db_msg

@router.get("/", response_model=list[MessageOut])
def get_messages(channel_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user), org: Organization = Depends(get_current_organization)):
    return db.query(Message).filter(Message.channel_id == channel_id, Message.organization_id == org.id).all()

from app.models.saved_message import SavedMessage

@router.get("/mentions", response_model=list[MessageOut])
def list_mentions(db: Session = Depends(get_db), current_user: User = Depends(get_current_user), org: Organization = Depends(get_current_organization)):
    pattern_name = f"%@{current_user.full_name}%" if current_user.full_name else None
    pattern_email = f"%@{current_user.email}%"
    pattern_all = "%@all%"
    
    query = db.query(Message).filter(Message.organization_id == org.id)
    if pattern_name:
        query = query.filter(
            (Message.content.like(pattern_name)) | 
            (Message.content.like(pattern_email)) | 
            (Message.content.like(pattern_all))
        )
    else:
        query = query.filter(
            (Message.content.like(pattern_email)) | 
            (Message.content.like(pattern_all))
        )
    return query.order_by(Message.created_at.desc()).all()

@router.get("/saved", response_model=list[MessageOut])
def list_saved_messages(db: Session = Depends(get_db), current_user: User = Depends(get_current_user), org: Organization = Depends(get_current_organization)):
    saved_items = db.query(SavedMessage).filter(SavedMessage.user_id == current_user.id).all()
    messages = []
    for item in saved_items:
        if item.message and item.message.organization_id == org.id:
            messages.append(item.message)
    return messages

@router.post("/{message_id}/save")
def save_message(message_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    existing = db.query(SavedMessage).filter(SavedMessage.user_id == current_user.id, SavedMessage.message_id == message_id).first()
    if not existing:
        db_saved = SavedMessage(user_id=current_user.id, message_id=message_id)
        db.add(db_saved)
        db.commit()
    return {"status": "success", "message_id": message_id}

@router.delete("/{message_id}/unsave")
def unsave_message(message_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    existing = db.query(SavedMessage).filter(SavedMessage.user_id == current_user.id, SavedMessage.message_id == message_id).first()
    if existing:
        db.delete(existing)
        db.commit()
    return {"status": "success", "message_id": message_id}
