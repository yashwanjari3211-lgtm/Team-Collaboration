from pydantic import BaseModel
from datetime import datetime

class OrgCreate(BaseModel):
    name: str
    description: str | None = None

class OrgOut(BaseModel):
    id: int
    name: str
    description: str | None
    created_at: datetime

    class Config:
        from_attributes = True
