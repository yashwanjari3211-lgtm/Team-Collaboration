from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.message import MessageCreate, MessageOut
from app.models.message import Message
from app.models.user import User
from app.models.organization import Organization
from app.utils.dependencies import get_current_user, get_current_organization

router = APIRouter()

@router.post("/", response_model=MessageOut)
def send_message(msg: MessageCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user), org: Organization = Depends(get_current_organization)):
    db_msg = Message(content=msg.content, channel_id=msg.channel_id, user_id=current_user.id, organization_id=org.id)
    db.add(db_msg)
    db.commit()
    db.refresh(db_msg)
    return db_msg

@router.get("/", response_model=list[MessageOut])
def get_messages(channel_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user), org: Organization = Depends(get_current_organization)):
    return db.query(Message).filter(Message.channel_id == channel_id, Message.organization_id == org.id).all()
