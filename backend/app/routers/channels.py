from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.channel import ChannelCreate, ChannelOut
from app.models.channel import Channel
from app.models.user import User
from app.models.organization import Organization
from app.utils.dependencies import get_current_user, get_current_organization, RoleChecker

router = APIRouter()

@router.post("/", response_model=ChannelOut)
def create_channel(channel: ChannelCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user), org: Organization = Depends(get_current_organization)):
    db_channel = Channel(name=channel.name, organization_id=org.id)
    db.add(db_channel)
    db.commit()
    db.refresh(db_channel)
    return db_channel

@router.get("/", response_model=list[ChannelOut])
def list_channels(db: Session = Depends(get_db), current_user: User = Depends(get_current_user), org: Organization = Depends(get_current_organization)):
    return db.query(Channel).filter(Channel.organization_id == org.id).all()

@router.delete("/{channel_id}")
def delete_channel(channel_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user), org: Organization = Depends(get_current_organization), role = Depends(RoleChecker(['admin', 'owner']))):
    db_channel = db.query(Channel).filter(Channel.id == channel_id, Channel.organization_id == org.id).first()
    if not db_channel:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Channel not found")
    db.delete(db_channel)
    db.commit()
    return {"message": "Channel deleted"}

@router.get("/dm/{target_user_id}", response_model=ChannelOut)
def get_or_create_dm_channel(target_user_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user), org: Organization = Depends(get_current_organization)):
    # Generate unique implicit channel name for DM
    min_id = min(current_user.id, target_user_id)
    max_id = max(current_user.id, target_user_id)
    dm_name = f"dm_{min_id}_{max_id}"
    
    # Check if exists
    db_channel = db.query(Channel).filter(Channel.name == dm_name, Channel.organization_id == org.id).first()
    if not db_channel:
        # Create it
        db_channel = Channel(name=dm_name, organization_id=org.id)
        db.add(db_channel)
        db.commit()
        db.refresh(db_channel)
    return db_channel
