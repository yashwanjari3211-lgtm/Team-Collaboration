from pydantic import BaseModel
from datetime import datetime
from app.schemas.user import UserOut

class MessageCreate(BaseModel):
    content: str
    channel_id: int

class MessageOut(BaseModel):
    id: int
    content: str
    channel_id: int
    user_id: int
    organization_id: int
    created_at: datetime
    user: UserOut | None = None

    class Config:
        from_attributes = True
