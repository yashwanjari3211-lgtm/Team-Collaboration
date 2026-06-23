from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.channel import ChannelCreate, ChannelOut
from app.models.channel import Channel
from app.models.user import User
from app.utils.dependencies import get_current_user

router = APIRouter()

@router.post("/", response_model=ChannelOut)
def create_channel(channel: ChannelCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    db_channel = Channel(name=channel.name, workspace_id=channel.workspace_id)
    db.add(db_channel)
    db.commit()
    db.refresh(db_channel)
    return db_channel

@router.get("/", response_model=list[ChannelOut])
def list_channels(workspace_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return db.query(Channel).filter(Channel.workspace_id == workspace_id).all()
