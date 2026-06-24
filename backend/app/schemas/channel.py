from pydantic import BaseModel
from datetime import datetime

class ChannelCreate(BaseModel):
    name: str

class ChannelOut(BaseModel):
    id: int
    name: str
    organization_id: int
    created_at: datetime

    class Config:
        from_attributes = True
