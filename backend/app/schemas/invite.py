from pydantic import BaseModel, EmailStr
from datetime import datetime

class InviteCreate(BaseModel):
    email: EmailStr
    role: str = "member"

class InviteOut(BaseModel):
    id: int
    email: str
    organization_id: int
    token: str
    role: str
    status: str
    created_at: datetime

    class Config:
        from_attributes = True

class InviteAccept(BaseModel):
    token: str
