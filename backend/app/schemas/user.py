from pydantic import BaseModel, EmailStr
from datetime import datetime

class UserCreate(BaseModel):
    email: EmailStr
    password: str
    full_name: str | None = None

class UserUpdate(BaseModel):
    full_name: str | None = None
    status: str | None = None

class UserOut(BaseModel):
    id: int
    email: str
    full_name: str | None
    avatar: str | None
    status: str | None = None
    created_at: datetime

    class Config:
        from_attributes = True
