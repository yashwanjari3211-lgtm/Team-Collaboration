from pydantic import BaseModel
from datetime import datetime

class ChannelCreate(BaseModel):
    name: str
    workspace_id: int

class ChannelOut(BaseModel):
    id: int
    name: str
    workspace_id: int
    created_at: datetime

    class Config:
        from_attributes = True
